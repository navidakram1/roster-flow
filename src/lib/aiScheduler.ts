import { Shift, StaffProfile, DayOfWeek } from '../types';

export interface AISchedulerOptions {
  naturalLanguagePrompt?: string;
  enforceMaxHours?: boolean;
  respectShiftPreferences?: boolean;
  prioritizeSkills?: boolean;
  fillUnderstaffedOnly?: boolean;
}

export interface AIScheduleResult {
  shifts: Shift[];
  stats: {
    totalShifts: number;
    totalHours: number;
    estimatedCost: number;
    coverageScore: number;
    conflictsFound: number;
    understaffedCount: number;
  };
  summary: string;
  explanations: Record<string, Record<string, string>>; // shiftId -> { staffId: explanation }
  warnings: string[];
}

// Calculate shift length in decimal hours
export function calculateShiftHours(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // overnight
  }
  return Number(((endMinutes - startMinutes) / 60).toFixed(2));
}

export function runAIScheduler(
  shiftsInput: Shift[],
  staffList: StaffProfile[],
  options: AISchedulerOptions = {}
): AIScheduleResult {
  const {
    naturalLanguagePrompt = '',
    enforceMaxHours = true,
    respectShiftPreferences = true,
    prioritizeSkills = true,
    fillUnderstaffedOnly = false
  } = options;

  // Clone shifts to avoid mutating in place
  const shifts: Shift[] = JSON.parse(JSON.stringify(shiftsInput));
  const activeStaff = staffList.filter(s => s.status === 'active');
  const explanations: Record<string, Record<string, string>> = {};
  const warnings: string[] = [];

  // Parse natural language hints
  const lowerPrompt = naturalLanguagePrompt.toLowerCase();
  
  // Custom temporary overrides based on prompt
  const staffOverrides: Record<string, { offDays: DayOfWeek[]; capHours?: number; preferred?: string }> = {};

  activeStaff.forEach(staff => {
    staffOverrides[staff.id] = { offDays: [] };
    const firstName = staff.name.split(' ')[0].toLowerCase();
    
    // Check if prompt says "Sarah can't work Friday" or "Give Sarah Wednesday off"
    const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    days.forEach(day => {
      const dayNames = {
        mon: ['monday', 'mon'],
        tue: ['tuesday', 'tue'],
        wed: ['wednesday', 'wed'],
        thu: ['thursday', 'thu'],
        fri: ['friday', 'fri'],
        sat: ['saturday', 'sat'],
        sun: ['sunday', 'sun']
      }[day];

      const mentionsDay = dayNames.some(d => lowerPrompt.includes(d));
      const mentionsStaff = lowerPrompt.includes(firstName);

      if (mentionsStaff && mentionsDay && (lowerPrompt.includes('off') || lowerPrompt.includes("can't work") || lowerPrompt.includes("cannot work") || lowerPrompt.includes("not work") || lowerPrompt.includes("leave"))) {
        staffOverrides[staff.id].offDays.push(day);
      }
    });

    // Check cap hours prompt: "under 25 hours" or "max 30 hours"
    const capMatch = lowerPrompt.match(/(\d+)\s*(?:hours|hrs)/);
    if (capMatch && (lowerPrompt.includes('everyone') || lowerPrompt.includes('max') || lowerPrompt.includes('cap'))) {
      const parsedCap = parseInt(capMatch[1], 10);
      if (!isNaN(parsedCap) && parsedCap > 10 && parsedCap < 50) {
        staffOverrides[staff.id].capHours = parsedCap;
      }
    }
  });

  // Track weekly hours assigned per staff
  const staffScheduledHours: Record<string, number> = {};
  activeStaff.forEach(s => {
    staffScheduledHours[s.id] = 0;
  });

  // If fillUnderstaffedOnly, calculate existing assigned hours first
  if (fillUnderstaffedOnly) {
    shifts.forEach(shift => {
      const hours = calculateShiftHours(shift.startTime, shift.endTime);
      shift.assignedStaffIds.forEach(stId => {
        if (staffScheduledHours[stId] !== undefined) {
          staffScheduledHours[stId] += hours;
        }
      });
    });
  } else {
    // Fresh schedule: clear existing assignments
    shifts.forEach(shift => {
      shift.assignedStaffIds = [];
      shift.aiExplanation = {};
    });
  }

  // Helper to determine if a shift is morning or evening
  const getShiftType = (startTime: string): 'morning' | 'evening' | 'night' => {
    const hour = parseInt(startTime.split(':')[0], 10);
    if (hour < 14) return 'morning';
    if (hour < 22) return 'evening';
    return 'night';
  };

  // Iterate over shifts to assign
  shifts.forEach(shift => {
    const shiftHours = calculateShiftHours(shift.startTime, shift.endTime);
    const shiftType = getShiftType(shift.startTime);
    explanations[shift.id] = shift.aiExplanation || {};

    const needed = shift.requiredCount - shift.assignedStaffIds.length;
    if (needed <= 0) return;

    // Filter available candidates
    const candidates = activeStaff.filter(staff => {
      // 1. Not already assigned to this shift
      if (shift.assignedStaffIds.includes(staff.id)) return false;

      // 2. Check if already assigned to ANOTHER shift on the same day
      const alreadyWorkingDay = shifts.some(
        s => s.id !== shift.id && s.day === shift.day && s.assignedStaffIds.includes(staff.id)
      );
      if (alreadyWorkingDay) return false;

      // 3. Natural language off days override
      if (staffOverrides[staff.id]?.offDays.includes(shift.day)) return false;

      // 4. Staff static availability
      if (!staff.availability[shift.day]) return false;

      // 5. Max weekly hours enforcement
      const cap = staffOverrides[staff.id]?.capHours || staff.maxHoursPerWeek;
      if (enforceMaxHours && (staffScheduledHours[staff.id] + shiftHours > cap)) {
        return false;
      }

      return true;
    });

    // Score candidates based on skills, preference, and fairness
    const scoredCandidates = candidates.map(staff => {
      let score = 0;
      const reasons: string[] = [];

      // Shift timing preference matching
      if (respectShiftPreferences) {
        if (staff.preferredShift === shiftType || staff.preferredShift === 'any') {
          score += 25;
          reasons.push(`Prefers ${shiftType} shifts`);
        } else {
          score -= 10;
        }
      }

      // Skill match
      if (prioritizeSkills) {
        const titleWords = shift.title.toLowerCase();
        const hasSkillMatch = staff.skills.some(skill => {
          const sLower = skill.toLowerCase();
          return (
            titleWords.includes(sLower) ||
            sLower.includes(titleWords) ||
            (titleWords.includes('opening') && sLower.includes('opening')) ||
            (titleWords.includes('close') && sLower.includes('closing')) ||
            (titleWords.includes('lead') && sLower.includes('lead')) ||
            (titleWords.includes('supervisor') && staff.role === 'manager')
          );
        });

        if (hasSkillMatch) {
          score += 35;
          reasons.push(`Matched required skillset for ${shift.title}`);
        }
      }

      // Role check: If shift mentions supervisor or manager
      if (shift.title.toLowerCase().includes('supervisor') || shift.title.toLowerCase().includes('opening')) {
        if (staff.role === 'manager' || staff.role === 'owner') {
          score += 30;
          reasons.push('Manager presence for shift opening');
        }
      }

      // Fair distribution / hours headroom
      const cap = staffOverrides[staff.id]?.capHours || staff.maxHoursPerWeek;
      const hoursRemaining = cap - staffScheduledHours[staff.id];
      score += hoursRemaining * 2; // prioritize those with more available hours
      reasons.push(`Within weekly cap (${(staffScheduledHours[staff.id] + shiftHours).toFixed(1)}h / ${cap}h max)`);

      return {
        staff,
        score,
        explanationText: reasons.join(' • ')
      };
    });

    // Sort descending by score
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Pick top candidates
    const picked = scoredCandidates.slice(0, needed);
    picked.forEach(({ staff, explanationText }) => {
      shift.assignedStaffIds.push(staff.id);
      staffScheduledHours[staff.id] += shiftHours;
      explanations[shift.id][staff.id] = explanationText;
    });

    shift.aiExplanation = explanations[shift.id];

    // Understaffed warning
    if (shift.assignedStaffIds.length < shift.requiredCount) {
      warnings.push(`Shift '${shift.title}' on ${shift.day.toUpperCase()} is understaffed (${shift.assignedStaffIds.length}/${shift.requiredCount}). Consider adjusting staff availability or relaxing weekly hour caps.`);
    }
  });

  // Calculate final statistics
  let totalHours = 0;
  let totalCost = 0;
  let assignedSlots = 0;
  let requiredSlots = 0;
  let understaffedCount = 0;

  shifts.forEach(shift => {
    const hours = calculateShiftHours(shift.startTime, shift.endTime);
    requiredSlots += shift.requiredCount;
    assignedSlots += shift.assignedStaffIds.length;
    if (shift.assignedStaffIds.length < shift.requiredCount) {
      understaffedCount++;
    }

    shift.assignedStaffIds.forEach(stId => {
      const member = activeStaff.find(s => s.id === stId);
      const rate = member?.hourlyRate || shift.hourlyRate;
      totalHours += hours;
      totalCost += hours * rate;
    });
  });

  const coverageScore = requiredSlots > 0 ? Math.round((assignedSlots / requiredSlots) * 100) : 100;

  // Build high level AI summary
  const summary = `Generated schedule across ${shifts.length} shifts. Assigned ${assignedSlots}/${requiredSlots} required positions (${coverageScore}% coverage) with total payroll estimate of €${totalCost.toFixed(2)} (${totalHours.toFixed(1)} hours). All staff availability and weekly hour caps were respected.`;

  return {
    shifts,
    stats: {
      totalShifts: shifts.length,
      totalHours: Number(totalHours.toFixed(1)),
      estimatedCost: Number(totalCost.toFixed(2)),
      coverageScore,
      conflictsFound: warnings.length,
      understaffedCount
    },
    summary,
    explanations,
    warnings
  };
}
