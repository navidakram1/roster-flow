'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Business,
  StaffProfile,
  Roster,
  Shift,
  ShiftTemplate,
  AttendanceRecord,
  Task,
  SwapRequest,
  AppNotification,
  DayOfWeek
} from '../types';
import {
  initialBusinesses,
  initialStaff,
  initialRoster,
  initialTemplates,
  initialAttendance,
  initialTasks,
  initialSwapRequests,
  initialNotifications
} from '../data/mockData';
import { runAIScheduler, AISchedulerOptions, AIScheduleResult } from '../lib/aiScheduler';

interface RosterContextType {
  // Database Connection
  isDbConnected: boolean;
  dbEngine: string;

  // Business & Multi-tenancy
  businesses: Business[];
  currentBusiness: Business;
  setCurrentBusiness: (biz: Business) => void;
  createNewBusiness: (name: string, businessType: string, address: string) => Business;
  inviteLink: string;

  // Role Simulation
  activeRole: 'owner' | 'manager' | 'staff';
  setActiveRole: (role: 'owner' | 'manager' | 'staff') => void;
  activeStaffId: string;
  setActiveStaffId: (id: string) => void;
  currentStaffProfile?: StaffProfile;

  // Staff Management
  staffList: StaffProfile[];
  updateStaffProfile: (staff: StaffProfile) => void;
  approveStaffJoin: (staffId: string) => void;
  rejectStaffJoin: (staffId: string) => void;
  simulateStaffJoinLink: (name: string, roleTitle: string, email: string) => void;

  // Roster Management
  roster: Roster;
  viewMode: 'daily' | 'weekly' | 'monthly';
  setViewMode: (mode: 'daily' | 'weekly' | 'monthly') => void;
  selectedDay: DayOfWeek;
  setSelectedDay: (day: DayOfWeek) => void;
  templates: ShiftTemplate[];
  applyTemplate: (templateId: string) => void;
  applyTemplateToDay: (templateId: string, targetDay: DayOfWeek) => void;
  saveTemplate: (template: ShiftTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  saveCurrentDayAsTemplate: (name: string, description: string, day: DayOfWeek) => ShiftTemplate;
  addShift: (shift: Omit<Shift, 'id' | 'businessId' | 'rosterId'>) => void;
  updateShift: (shift: Shift) => void;
  deleteShift: (shiftId: string) => void;
  assignStaffToShift: (shiftId: string, staffId: string) => void;
  removeStaffFromShift: (shiftId: string, staffId: string) => void;
  publishRoster: () => void;
  unpublishRoster: () => void;

  // AI Roster
  aiGenerateRoster: (options?: AISchedulerOptions) => AIScheduleResult;
  lastAiResult: AIScheduleResult | null;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  activeAttendance?: AttendanceRecord;
  checkInStaff: (staffId: string, shiftId: string) => void;
  toggleBreakStaff: (attendanceId: string) => void;
  checkOutStaff: (attendanceId: string) => void;

  // Tasks
  tasks: Task[];
  createTask: (task: Omit<Task, 'id' | 'businessId' | 'status' | 'completedAt'>) => void;
  toggleTaskStatus: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  generateAITasks: (type: 'opening' | 'closing' | 'mid') => void;

  // Swaps
  swapRequests: SwapRequest[];
  createSwapRequest: (shiftId: string, requesterStaffId: string, targetStaffId?: string, reason?: string) => void;
  approveSwapRequest: (swapId: string) => void;
  rejectSwapRequest: (swapId: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  selectedEmailPreview: AppNotification | null;
  setSelectedEmailPreview: (notif: AppNotification | null) => void;

  // Reset
  resetToDefaultData: () => void;
}

const RosterContext = createContext<RosterContextType | undefined>(undefined);

export const RosterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const STORAGE_KEY = 'rosterflow_state_v1';

  // DB Connection status
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbEngine, setDbEngine] = useState('PostgreSQL (PGlite embedded)');

  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [currentBusiness, setCurrentBusiness] = useState<Business>(initialBusinesses[0]);

  // Role simulation
  const [activeRole, setActiveRole] = useState<'owner' | 'manager' | 'staff'>('owner');
  const [activeStaffId, setActiveStaffId] = useState<string>('staff_sarah');

  // Staff
  const [staffList, setStaffList] = useState<StaffProfile[]>(initialStaff);

  // Roster
  const [roster, setRoster] = useState<Roster>(initialRoster);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('mon');
  const [templates, setTemplates] = useState<ShiftTemplate[]>(initialTemplates);
  const [lastAiResult, setLastAiResult] = useState<AIScheduleResult | null>(null);

  // Attendance
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Swaps
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(initialSwapRequests);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<AppNotification | null>(null);

  // Helper to sync mutations asynchronously to PostgreSQL
  const syncToPg = async (action: string, payload: any) => {
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
    } catch (err) {
      console.warn('PostgreSQL background sync warning:', err);
    }
  };

  // Hydrate from internal PostgreSQL database on mount
  useEffect(() => {
    let isMounted = true;
    const fetchFromPg = async () => {
      try {
        const res = await fetch('/api/db');
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          if (json.data.businesses?.length) setBusinesses(json.data.businesses);
          if (json.data.staffList?.length) setStaffList(json.data.staffList);
          if (json.data.roster?.shifts) setRoster(json.data.roster);
          if (json.data.attendanceRecords?.length) setAttendanceRecords(json.data.attendanceRecords);
          if (json.data.tasks?.length) setTasks(json.data.tasks);
          if (json.data.swapRequests) setSwapRequests(json.data.swapRequests);
          if (json.data.notifications) setNotifications(json.data.notifications);
          setIsDbConnected(true);
          setDbEngine(json.engine || 'PostgreSQL (PGlite embedded)');
        }
      } catch {
        // Fallback to local storage if API is not yet reachable
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.businesses) setBusinesses(parsed.businesses);
            if (parsed.currentBusiness) setCurrentBusiness(parsed.currentBusiness);
            if (parsed.staffList) setStaffList(parsed.staffList);
            if (parsed.roster) setRoster(parsed.roster);
            if (parsed.attendanceRecords) setAttendanceRecords(parsed.attendanceRecords);
            if (parsed.tasks) setTasks(parsed.tasks);
            if (parsed.swapRequests) setSwapRequests(parsed.swapRequests);
            if (parsed.notifications) setNotifications(parsed.notifications);
          }
        } catch {
          // ignore
        }
      }
    };
    fetchFromPg();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save to LocalStorage as secondary local cache
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          businesses,
          currentBusiness,
          staffList,
          roster,
          attendanceRecords,
          tasks,
          swapRequests,
          notifications
        })
      );
    } catch {
      // ignore
    }
  }, [businesses, currentBusiness, staffList, roster, attendanceRecords, tasks, swapRequests, notifications]);

  // Derived active staff profile
  const currentStaffProfile = staffList.find(s => s.id === activeStaffId);

  // Deep invite link
  const inviteLink = `https://rosterflow.app/join/${currentBusiness.inviteCode}`;

  // Find active ongoing attendance for current staff
  const activeAttendance = attendanceRecords.find(
    a => a.staffId === activeStaffId && (a.status === 'checked_in' || a.status === 'on_break')
  );

  // Create new business room
  const createNewBusiness = (name: string, businessType: string, address: string): Business => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newBiz: Business = {
      id: `biz_${Date.now()}`,
      name,
      slug,
      inviteCode: `${slug.slice(0, 4)}-${randomCode}`,
      businessType,
      timezone: 'Europe/Dublin (GMT+1)',
      address: address || 'Main Commercial Street',
      currency: '€'
    };
    setBusinesses(prev => [newBiz, ...prev]);
    setCurrentBusiness(newBiz);
    return newBiz;
  };

  // Staff operations
  const updateStaffProfile = (updated: StaffProfile) => {
    setStaffList(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    syncToPg('save_staff', updated);
  };

  const approveStaffJoin = (staffId: string) => {
    let approvedMember: StaffProfile | undefined;
    setStaffList(prev =>
      prev.map(s => {
        if (s.id === staffId) {
          approvedMember = { ...s, status: 'active' as const };
          return approvedMember;
        }
        return s;
      })
    );

    if (approvedMember) {
      syncToPg('save_staff', approvedMember);
      addNotification({
        type: 'swap_approved',
        title: 'Staff Onboarding Approved',
        message: `${approvedMember.name} has been approved to join ${currentBusiness.name}.`,
        link: '/staff',
        emailDetails: {
          to: approvedMember.email,
          subject: `Welcome to ${currentBusiness.name} Team!`,
          preview: `Hi ${approvedMember.name}, your request to join ${currentBusiness.name} has been approved by the owner.`
        }
      });
    }
  };

  const rejectStaffJoin = (staffId: string) => {
    setStaffList(prev => prev.filter(s => s.id !== staffId));
  };

  const simulateStaffJoinLink = (name: string, roleTitle: string, email: string) => {
    const newStaff: StaffProfile = {
      id: `staff_sim_${Date.now()}`,
      businessId: currentBusiness.id,
      name,
      email,
      phone: '+353 87 ' + Math.floor(1000000 + Math.random() * 9000000),
      role: 'staff',
      jobTitle: roleTitle,
      hourlyRate: 15.00,
      maxHoursPerWeek: 30,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (Date.now() % 1000)}?w=150&auto=format&fit=crop&q=80`,
      skills: [roleTitle, 'Customer Care', 'Flexible'],
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
      preferredShift: 'any',
      status: 'pending_approval',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setStaffList(prev => [...prev, newStaff]);
    syncToPg('save_staff', newStaff);

    addNotification({
      type: 'swap_request',
      title: 'New Staff Join Request',
      message: `${name} clicked the room invite link (${currentBusiness.inviteCode}) and requested to join.`,
      link: '/staff',
      emailDetails: {
        to: 'owner@rosterflow.app',
        subject: `New Team Member Request: ${name}`,
        preview: `${name} has applied to join your ${currentBusiness.name} workspace.`
      }
    });
  };

  // Helper to add notification
  const addNotification = (notif: Omit<AppNotification, 'id' | 'businessId' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      businessId: currentBusiness.id,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Roster operations
  const addShift = (shiftData: Omit<Shift, 'id' | 'businessId' | 'rosterId'>) => {
    const newShift: Shift = {
      ...shiftData,
      id: `shift_${Date.now()}`,
      businessId: currentBusiness.id,
      rosterId: roster.id
    };
    setRoster(prev => ({
      ...prev,
      shifts: [...prev.shifts, newShift]
    }));
    syncToPg('save_shift', newShift);
  };

  const updateShift = (updatedShift: Shift) => {
    setRoster(prev => ({
      ...prev,
      shifts: prev.shifts.map(s => (s.id === updatedShift.id ? updatedShift : s))
    }));
    syncToPg('save_shift', updatedShift);
  };

  const deleteShift = (shiftId: string) => {
    setRoster(prev => ({
      ...prev,
      shifts: prev.shifts.filter(s => s.id !== shiftId)
    }));
    syncToPg('delete_shift', { shiftId });
  };

  const assignStaffToShift = (shiftId: string, staffId: string) => {
    let updatedShift: Shift | undefined;
    setRoster(prev => ({
      ...prev,
      shifts: prev.shifts.map(s => {
        if (s.id === shiftId && !s.assignedStaffIds.includes(staffId)) {
          updatedShift = {
            ...s,
            assignedStaffIds: [...s.assignedStaffIds, staffId]
          };
          return updatedShift;
        }
        return s;
      })
    }));
    if (updatedShift) {
      syncToPg('save_shift', updatedShift);
    }
  };

  const removeStaffFromShift = (shiftId: string, staffId: string) => {
    let updatedShift: Shift | undefined;
    setRoster(prev => ({
      ...prev,
      shifts: prev.shifts.map(s => {
        if (s.id === shiftId) {
          updatedShift = {
            ...s,
            assignedStaffIds: s.assignedStaffIds.filter(id => id !== staffId)
          };
          return updatedShift;
        }
        return s;
      })
    }));
    if (updatedShift) {
      syncToPg('save_shift', updatedShift);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const dayOffsets: Record<DayOfWeek, number> = {
      mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6
    };

    const newShifts: Shift[] = template.shifts.map((tShift, idx) => {
      const baseDate = new Date(roster.weekStart);
      baseDate.setDate(baseDate.getDate() + dayOffsets[tShift.day]);
      const dateStr = baseDate.toISOString().split('T')[0];

      return {
        id: `shift_tpl_${Date.now()}_${idx}`,
        businessId: currentBusiness.id,
        rosterId: roster.id,
        day: tShift.day,
        date: dateStr,
        startTime: tShift.startTime,
        endTime: tShift.endTime,
        title: tShift.title,
        requiredCount: tShift.requiredCount,
        hourlyRate: tShift.hourlyRate,
        assignedStaffIds: []
      };
    });

    const updatedRoster: Roster = {
      ...roster,
      shifts: newShifts,
      status: 'draft',
      aiNotes: `Generated from template "${template.name}". Shifts are ready for AI assignment.`
    };

    setRoster(updatedRoster);
    syncToPg('save_roster', updatedRoster);
  };

  const applyTemplateToDay = (templateId: string, targetDay: DayOfWeek) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const dayOffsets: Record<DayOfWeek, number> = {
      mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6
    };

    const baseDate = new Date(roster.weekStart);
    baseDate.setDate(baseDate.getDate() + dayOffsets[targetDay]);
    const dateStr = baseDate.toISOString().split('T')[0];

    // Find shifts from template matching this day, or use all shifts in template for this day
    const matchingTemplateShifts = template.shifts.filter(s => s.day === targetDay);
    const shiftsToUse = matchingTemplateShifts.length > 0 ? matchingTemplateShifts : template.shifts;

    const newShiftsForDay: Shift[] = shiftsToUse.map((tShift, idx) => ({
      id: `shift_day_tpl_${Date.now()}_${idx}`,
      businessId: currentBusiness.id,
      rosterId: roster.id,
      day: targetDay,
      date: dateStr,
      startTime: tShift.startTime,
      endTime: tShift.endTime,
      title: tShift.title,
      requiredCount: tShift.requiredCount,
      hourlyRate: tShift.hourlyRate,
      assignedStaffIds: []
    }));

    const updatedRoster: Roster = {
      ...roster,
      shifts: [
        ...roster.shifts.filter(s => s.day !== targetDay),
        ...newShiftsForDay
      ],
      status: 'draft',
      aiNotes: `Applied template "${template.name}" to ${targetDay.toUpperCase()}.`
    };

    setRoster(updatedRoster);
    syncToPg('save_roster', updatedRoster);
  };

  const saveTemplate = (template: ShiftTemplate) => {
    setTemplates(prev => {
      const exists = prev.some(t => t.id === template.id);
      if (exists) {
        return prev.map(t => (t.id === template.id ? template : t));
      }
      return [template, ...prev];
    });
    syncToPg('save_template', template);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    syncToPg('delete_template', { templateId });
  };

  const saveCurrentDayAsTemplate = (name: string, description: string, day: DayOfWeek): ShiftTemplate => {
    const dayShifts = roster.shifts.filter(s => s.day === day);
    const newTemplate: ShiftTemplate = {
      id: `tpl_${Date.now()}`,
      businessId: currentBusiness.id,
      name,
      description: description || `Created from ${day.toUpperCase()} schedule with ${dayShifts.length} shifts`,
      shifts: dayShifts.map(s => ({
        day,
        startTime: s.startTime,
        endTime: s.endTime,
        title: s.title,
        requiredCount: s.requiredCount,
        hourlyRate: s.hourlyRate
      }))
    };

    saveTemplate(newTemplate);
    return newTemplate;
  };

  const publishRoster = () => {
    const updatedRoster: Roster = {
      ...roster,
      status: 'published',
      publishedAt: new Date().toLocaleString()
    };
    setRoster(updatedRoster);
    syncToPg('save_roster', updatedRoster);

    addNotification({
      type: 'roster_published',
      title: 'Weekly Roster Published',
      message: `The schedule for ${roster.name} has been finalized and published.`,
      link: '/roster',
      emailDetails: {
        to: 'staff-all@navidscafe.com',
        subject: `[Roster Published] ${roster.name}`,
        preview: `Hello team, the schedule for next week has been officially released. Check your shifts and confirm availability.`
      }
    });
  };

  const unpublishRoster = () => {
    const updatedRoster: Roster = {
      ...roster,
      status: 'draft'
    };
    setRoster(updatedRoster);
    syncToPg('save_roster', updatedRoster);
  };

  // Run AI Scheduler
  const aiGenerateRoster = (options?: AISchedulerOptions): AIScheduleResult => {
    const result = runAIScheduler(roster.shifts, staffList, options);
    const updatedRoster: Roster = {
      ...roster,
      shifts: result.shifts,
      aiGenerated: true,
      aiNotes: result.summary
    };
    setRoster(updatedRoster);
    setLastAiResult(result);
    syncToPg('save_roster', updatedRoster);
    return result;
  };

  // Attendance Clocking
  const checkInStaff = (staffId: string, shiftId: string) => {
    const shift = roster.shifts.find(s => s.id === shiftId);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      businessId: currentBusiness.id,
      staffId,
      shiftId,
      date: dateStr,
      shiftTitle: shift?.title || 'General Shift',
      scheduledStart: shift?.startTime || '08:00',
      scheduledEnd: shift?.endTime || '16:00',
      checkIn: timeStr,
      breakMinutes: 0,
      status: 'checked_in',
      calculatedHours: 0,
      calculatedWage: 0
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
    syncToPg('save_attendance', newRecord);
  };

  const toggleBreakStaff = (attendanceId: string) => {
    let updatedRecord: AttendanceRecord | undefined;
    setAttendanceRecords(prev =>
      prev.map(rec => {
        if (rec.id === attendanceId) {
          const nextStatus = rec.status === 'checked_in' ? 'on_break' : 'checked_in';
          const breakInc = rec.status === 'on_break' ? 15 : 0;
          updatedRecord = {
            ...rec,
            status: nextStatus,
            breakMinutes: rec.breakMinutes + breakInc
          };
          return updatedRecord;
        }
        return rec;
      })
    );
    if (updatedRecord) {
      syncToPg('save_attendance', updatedRecord);
    }
  };

  const checkOutStaff = (attendanceId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedRecord: AttendanceRecord | undefined;

    setAttendanceRecords(prev =>
      prev.map(rec => {
        if (rec.id === attendanceId) {
          const staff = staffList.find(s => s.id === rec.staffId);
          const rate = staff?.hourlyRate || 15.00;

          let hours = 8;
          if (rec.checkIn) {
            const [inH, inM] = rec.checkIn.split(':').map(Number);
            const [outH, outM] = timeStr.split(':').map(Number);
            const inMins = inH * 60 + inM;
            const outMins = outH * 60 + outM;
            const diff = (outMins - inMins - rec.breakMinutes) / 60;
            hours = Math.max(0.2, Number(diff.toFixed(2)));
          }

          updatedRecord = {
            ...rec,
            checkOut: timeStr,
            status: 'completed' as const,
            calculatedHours: hours,
            calculatedWage: Number((hours * rate).toFixed(2))
          };
          return updatedRecord;
        }
        return rec;
      })
    );
    if (updatedRecord) {
      syncToPg('save_attendance', updatedRecord);
    }
  };

  // Task Operations
  const createTask = (taskData: Omit<Task, 'id' | 'businessId' | 'status' | 'completedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      businessId: currentBusiness.id,
      status: 'pending',
      reminderSent: true
    };
    setTasks(prev => [newTask, ...prev]);
    syncToPg('save_task', newTask);

    if (newTask.assignedStaffId) {
      const assigned = staffList.find(s => s.id === newTask.assignedStaffId);
      if (assigned) {
        addNotification({
          type: 'task_assigned',
          title: 'New Operational Task Assigned',
          message: `${assigned.name} was assigned: "${newTask.title}" (Due: ${newTask.dueTime}).`,
          link: '/tasks',
          emailDetails: {
            to: assigned.email,
            subject: `[Task Assigned] ${newTask.title}`,
            preview: `Hi ${assigned.name}, you have a new task scheduled for your shift today: ${newTask.title}. Due by ${newTask.dueTime}.`
          }
        });
      }
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    let updatedTask: Task | undefined;
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          updatedTask = {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
          };
          return updatedTask;
        }
        return t;
      })
    );
    if (updatedTask) {
      syncToPg('save_task', updatedTask);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    syncToPg('delete_task', { taskId });
  };

  const generateAITasks = (shiftType: 'opening' | 'closing' | 'mid') => {
    const today = new Date().toISOString().split('T')[0];
    const taskTemplates = {
      opening: [
        { title: 'Espresso boiler calibration & bean hopper fill', desc: 'Calibrate grind to 36g espresso output in 29 seconds. Inspect water filtration TDS meter.', time: '07:30', prio: 'high' as const },
        { title: 'Pastry case display & bake warm scones', desc: 'Arrange morning croissants, sourdough baguettes, and fresh fruit Danishes. Update allergy chalkboard.', time: '07:45', prio: 'high' as const },
        { title: 'POS till verification & float count', desc: 'Verify €250 base float in register drawer #1. Check thermal paper rolls.', time: '07:55', prio: 'normal' as const }
      ],
      closing: [
        { title: 'Deep Cafiza backflush on all espresso group heads', desc: 'Five 10-second purge cycles per group head. Soak steam wands and portafilters in hot degreasing bath.', time: '22:15', prio: 'high' as const },
        { title: 'Fridge temperature log & sanitization wipe down', desc: 'Record milk and food refrigeration temperatures in HACCP binder. Sanitize prep surfaces with food-safe mist.', time: '22:30', prio: 'high' as const },
        { title: 'Reconcile credit card batch & drop safe envelope', desc: 'Run terminal settlement, verify total against POS report, seal cash in safe drop envelope #94.', time: '22:45', prio: 'high' as const }
      ],
      mid: [
        { title: 'Mid-day milk & organic oat carton restocking', desc: 'Transfer 20 cartons of oat milk and 15 whole milk jugs from walk-in cold storage to under-counter chillers.', time: '13:00', prio: 'normal' as const },
        { title: 'Clean guest dining terrace & wipe high-touch tables', desc: 'Sweep entrance vestibule, empty condiment bins, ensure sugar shakers are topped.', time: '14:30', prio: 'normal' as const }
      ]
    }[shiftType];

    const activeStaffOnDuty = staffList.filter(s => s.status === 'active');

    taskTemplates.forEach((t, index) => {
      const assigned = activeStaffOnDuty[index % activeStaffOnDuty.length];
      createTask({
        title: t.title,
        description: t.desc,
        assignedStaffId: assigned?.id,
        shiftType,
        dueDate: today,
        dueTime: t.time,
        priority: t.prio,
        recurring: 'daily'
      });
    });
  };

  // Swapping Operations
  const createSwapRequest = (
    shiftId: string,
    requesterStaffId: string,
    targetStaffId?: string,
    reason: string = 'Personal schedule conflict'
  ) => {
    const shift = roster.shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const requester = staffList.find(s => s.id === requesterStaffId);
    const target = staffList.find(s => s.id === targetStaffId);

    const newSwap: SwapRequest = {
      id: `swap_${Date.now()}`,
      businessId: currentBusiness.id,
      shiftId,
      shiftTitle: shift.title,
      shiftDate: `${shift.day.toUpperCase()} (${shift.date})`,
      shiftTime: `${shift.startTime} – ${shift.endTime}`,
      requesterStaffId,
      targetStaffId,
      reason,
      status: targetStaffId ? 'pending_owner' : 'pending_staff',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSwapRequests(prev => [newSwap, ...prev]);
    syncToPg('save_swap', newSwap);

    addNotification({
      type: 'swap_request',
      title: 'Shift Swap Request Submitted',
      message: `${requester?.name || 'Staff'} requested to swap their ${shift.title} shift with ${target?.name || 'anyone'}.`,
      link: '/swaps',
      emailDetails: {
        to: target?.email || 'owner@rosterflow.app',
        subject: `[Shift Swap] Request for ${shift.title}`,
        preview: `${requester?.name} is requesting you to cover their ${shift.title} shift on ${shift.date}. Reason: ${reason}`
      }
    });
  };

  const approveSwapRequest = (swapId: string) => {
    let updatedSwap: SwapRequest | undefined;
    setSwapRequests(prev =>
      prev.map(sw => {
        if (sw.id === swapId) {
          updatedSwap = { ...sw, status: 'approved' as const };
          return updatedSwap;
        }
        return sw;
      })
    );

    const targetSwap = swapRequests.find(s => s.id === swapId);
    if (targetSwap && targetSwap.targetStaffId) {
      if (updatedSwap) syncToPg('save_swap', updatedSwap);

      // Reassign on roster
      setRoster(prev => {
        const nextShifts = prev.shifts.map(sh => {
          if (sh.id === targetSwap.shiftId) {
            const nextAssigned = sh.assignedStaffIds
              .filter(id => id !== targetSwap.requesterStaffId)
              .concat(targetSwap.targetStaffId!);
            const sUpdated = { ...sh, assignedStaffIds: nextAssigned };
            syncToPg('save_shift', sUpdated);
            return sUpdated;
          }
          return sh;
        });
        const rUpdated = { ...prev, shifts: nextShifts };
        syncToPg('save_roster', rUpdated);
        return rUpdated;
      });

      const reqStaff = staffList.find(s => s.id === targetSwap.requesterStaffId);
      const tgtStaff = staffList.find(s => s.id === targetSwap.targetStaffId);

      addNotification({
        type: 'swap_approved',
        title: 'Shift Swap Approved by Owner',
        message: `Swap approved: ${tgtStaff?.name} is now assigned to ${targetSwap.shiftTitle} in place of ${reqStaff?.name}.`,
        link: '/roster',
        emailDetails: {
          to: `${reqStaff?.email}, ${tgtStaff?.email}`,
          subject: `[Swap Confirmed] ${targetSwap.shiftTitle}`,
          preview: `The shift swap request has been approved by management. The official roster is updated.`
        }
      });
    }
  };

  const rejectSwapRequest = (swapId: string) => {
    let updatedSwap: SwapRequest | undefined;
    setSwapRequests(prev =>
      prev.map(sw => {
        if (sw.id === swapId) {
          updatedSwap = { ...sw, status: 'rejected' as const };
          return updatedSwap;
        }
        return sw;
      })
    );
    if (updatedSwap) {
      syncToPg('save_swap', updatedSwap);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const resetToDefaultData = () => {
    setBusinesses(initialBusinesses);
    setCurrentBusiness(initialBusinesses[0]);
    setStaffList(initialStaff);
    setRoster(initialRoster);
    setTemplates(initialTemplates);
    setAttendanceRecords(initialAttendance);
    setTasks(initialTasks);
    setSwapRequests(initialSwapRequests);
    setNotifications(initialNotifications);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    syncToPg('reset', {});
  };

  return (
    <RosterContext.Provider
      value={{
        isDbConnected,
        dbEngine,
        businesses,
        currentBusiness,
        setCurrentBusiness,
        createNewBusiness,
        inviteLink,
        activeRole,
        setActiveRole,
        activeStaffId,
        setActiveStaffId,
        currentStaffProfile,
        staffList,
        updateStaffProfile,
        approveStaffJoin,
        rejectStaffJoin,
        simulateStaffJoinLink,
        roster,
        viewMode,
        setViewMode,
        selectedDay,
        setSelectedDay,
        templates,
        applyTemplate,
        applyTemplateToDay,
        saveTemplate,
        deleteTemplate,
        saveCurrentDayAsTemplate,
        addShift,
        updateShift,
        deleteShift,
        assignStaffToShift,
        removeStaffFromShift,
        publishRoster,
        unpublishRoster,
        aiGenerateRoster,
        lastAiResult,
        attendanceRecords,
        activeAttendance,
        checkInStaff,
        toggleBreakStaff,
        checkOutStaff,
        tasks,
        createTask,
        toggleTaskStatus,
        deleteTask,
        generateAITasks,
        swapRequests,
        createSwapRequest,
        approveSwapRequest,
        rejectSwapRequest,
        notifications,
        markNotificationAsRead,
        selectedEmailPreview,
        setSelectedEmailPreview,
        resetToDefaultData
      }}
    >
      {children}
    </RosterContext.Provider>
  );
};

export const useRoster = () => {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error('useRoster must be used within a RosterProvider');
  }
  return context;
};
