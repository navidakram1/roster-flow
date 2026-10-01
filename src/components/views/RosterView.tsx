'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { Shift, DayOfWeek } from '../../types';
import {
  Calendar,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Send,
  SlidersHorizontal,
  Info,
  ArrowRightLeft,
  Briefcase,
  DollarSign,
  UserCheck,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  BookmarkCheck,
  Columns3,
  AlignLeft,
  GripVertical,
  X,
  UserPlus,
  ArrowDownCircle,
  Move,
  Download,
  Layers,
  Trash2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DownloadDoneIcon, SparkleAiIcon, SendIcon as AnimatedSendIcon } from '../ui/animated-state-icons';
import { exportWeeklyRosterPdf } from '../../lib/exportPdf';

export interface ShiftPresetItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  roleRequired: string;
  hourlyRate: number;
  color: string;
  icon: string;
}

export const SHIFT_PRESETS: ShiftPresetItem[] = [
  { id: 'morning', name: 'Morning Shift (Opening)', startTime: '07:30', endTime: '15:30', roleRequired: 'Operations Associate', hourlyRate: 16.5, color: '#2563eb', icon: '🌅' },
  { id: 'evening', name: 'Evening Shift (Closing)', startTime: '15:00', endTime: '22:30', roleRequired: 'Duty Manager', hourlyRate: 15.0, color: '#d97706', icon: '🌆' },
  { id: 'night', name: 'Night Shift (Overnight)', startTime: '22:30', endTime: '06:30', roleRequired: 'Security & Facility Specialist', hourlyRate: 19.0, color: '#7c3aed', icon: '🌙' }
];

interface RosterViewProps {
  onOpenAiModal: () => void;
  onOpenShiftEditModal: (shift?: Shift, defaultDay?: DayOfWeek) => void;
  onOpenSwapModal: (shift: Shift) => void;
  onOpenTemplateModal?: () => void;
  onOpenExportModal?: () => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  onOpenAiModal,
  onOpenShiftEditModal,
  onOpenSwapModal,
  onOpenTemplateModal,
  onOpenExportModal
}) => {
  const {
    roster,
    currentBusiness,
    viewMode,
    setViewMode,
    selectedDay,
    setSelectedDay,
    templates,
    applyTemplate,
    applyTemplateToDay,
    saveCurrentDayAsTemplate,
    addShift,
    deleteShift,
    assignStaffToShift,
    removeStaffFromShift,
    publishRoster,
    unpublishRoster,
    staffList,
    attendanceRecords,
    activeRole,
    activeStaffId
  } = useRoster();

  const [selectedAiReason, setSelectedAiReason] = useState<{ shift: Shift; staffId: string } | null>(null);
  const [dayViewStyle, setDayViewStyle] = useState<'square' | 'timeline'>('square');

  // Reusable Shift Presets
  const [selectedPreset, setSelectedPreset] = useState<ShiftPresetItem>(SHIFT_PRESETS[0]);

  const handleAddPresetShift = (targetDay: DayOfWeek, presetToUse?: ShiftPresetItem) => {
    const preset = presetToUse || selectedPreset;
    const dateMap: Record<DayOfWeek, string> = {
      mon: '2026-10-05',
      tue: '2026-10-06',
      wed: '2026-10-07',
      thu: '2026-10-08',
      fri: '2026-10-09',
      sat: '2026-10-10',
      sun: '2026-10-11'
    };

    addShift({
      date: dateMap[targetDay],
      day: targetDay,
      title: preset.name,
      startTime: preset.startTime,
      endTime: preset.endTime,
      requiredCount: 1,
      assignedStaffIds: [],
      hourlyRate: preset.hourlyRate,
      notes: `Preset: ${preset.name}`
    });

    try {
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
    } catch {}
  };

  // Drag and Drop States
  const [draggedStaffId, setDraggedStaffId] = useState<string | null>(null);
  const [dragSourceShiftId, setDragSourceShiftId] = useState<string | null>(null);
  const [dragOverShiftId, setDragOverShiftId] = useState<string | null>(null);
  const [isOverStaffDock, setIsOverStaffDock] = useState(false);

  const days: { key: DayOfWeek; label: string; dateNum: number; fullDate: string }[] = [
    { key: 'mon', label: 'Monday', dateNum: 5, fullDate: 'Monday, October 5, 2026' },
    { key: 'tue', label: 'Tuesday', dateNum: 6, fullDate: 'Tuesday, October 6, 2026' },
    { key: 'wed', label: 'Wednesday', dateNum: 7, fullDate: 'Wednesday, October 7, 2026' },
    { key: 'thu', label: 'Thursday', dateNum: 8, fullDate: 'Thursday, October 8, 2026' },
    { key: 'fri', label: 'Friday', dateNum: 9, fullDate: 'Friday, October 9, 2026' },
    { key: 'sat', label: 'Saturday', dateNum: 10, fullDate: 'Saturday, October 10, 2026' },
    { key: 'sun', label: 'Sunday', dateNum: 11, fullDate: 'Sunday, October 11, 2026' }
  ];

  const currentDayInfo = days.find(d => d.key === selectedDay) || days[0];

  const handlePublish = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
    publishRoster();
  };

  const handleQuickSaveTodayAsTemplate = () => {
    const tplName = prompt('Enter a name for this shift template:', `Standard ${selectedDay.toUpperCase()} Schedule`);
    if (tplName && tplName.trim()) {
      saveCurrentDayAsTemplate(tplName.trim(), `Saved from ${selectedDay.toUpperCase()} with ${dayShifts.length} shifts`, selectedDay);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
      alert(`Shift template "${tplName.trim()}" saved to settings!`);
    }
  };

  const handlePrevDay = () => {
    const idx = days.findIndex(d => d.key === selectedDay);
    if (idx > 0) {
      setSelectedDay(days[idx - 1].key);
    } else {
      setSelectedDay(days[days.length - 1].key);
    }
  };

  const handleNextDay = () => {
    const idx = days.findIndex(d => d.key === selectedDay);
    if (idx < days.length - 1) {
      setSelectedDay(days[idx + 1].key);
    } else {
      setSelectedDay(days[0].key);
    }
  };

  // Helper to calculate shift duration in hours
  const calculateShiftHours = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMins = sh * 60 + sm;
    let endMins = eh * 60 + em;
    if (endMins < startMins) endMins += 24 * 60;
    return Number(((endMins - startMins) / 60).toFixed(1));
  };

  // Day shifts sorted chronologically by start time
  const dayShifts = roster.shifts
    .filter(s => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalDayRequired = dayShifts.reduce((acc, s) => acc + s.requiredCount, 0);
  const totalDayAssigned = dayShifts.reduce((acc, s) => acc + s.assignedStaffIds.length, 0);
  const uniqueStaffIdsToday = Array.from(new Set(dayShifts.flatMap(s => s.assignedStaffIds)));

  const totalDayHours = dayShifts.reduce((acc, s) => {
    const hours = calculateShiftHours(s.startTime, s.endTime);
    return acc + hours * Math.max(s.assignedStaffIds.length, 1);
  }, 0);

  const totalDayWageCost = dayShifts.reduce((acc, s) => {
    const hours = calculateShiftHours(s.startTime, s.endTime);
    return acc + hours * s.hourlyRate * Math.max(s.assignedStaffIds.length, 1);
  }, 0);

  // Hourly grid definitions (07:00 to 22:00)
  const timelineHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  // Helper to get hourly coverage tally
  const getStaffCountForHour = (hour: number) => {
    let count = 0;
    dayShifts.forEach(shift => {
      const [sh] = shift.startTime.split(':').map(Number);
      const [eh] = shift.endTime.split(':').map(Number);
      const end = eh < sh ? eh + 24 : eh;
      if (hour >= sh && hour < end) {
        count += shift.assignedStaffIds.length;
      }
    });
    return count;
  };

  // Staff members rostered today
  const scheduledStaffMembers = staffList.filter(st =>
    dayShifts.some(shift => shift.assignedStaffIds.includes(st.id))
  );

  // Unassigned open shifts
  const unassignedShifts = dayShifts.filter(s => s.assignedStaffIds.length < s.requiredCount);

  // Monthly calendar dates (October 2026)
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  // =========================================================================
  // DRAG AND DROP HANDLERS
  // =========================================================================
  const handleDragStart = (e: React.DragEvent, staffId: string, sourceShiftId?: string) => {
    setDraggedStaffId(staffId);
    setDragSourceShiftId(sourceShiftId || null);
    e.dataTransfer.setData('application/json', JSON.stringify({ staffId, sourceShiftId }));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragOverShift = (e: React.DragEvent, shiftId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverShiftId !== shiftId) {
      setDragOverShiftId(shiftId);
    }
  };

  const handleDragLeaveShift = (e: React.DragEvent, shiftId: string) => {
    if (dragOverShiftId === shiftId) {
      setDragOverShiftId(null);
    }
  };

  const handleDropOnShift = (e: React.DragEvent, targetShiftId: string) => {
    e.preventDefault();
    setDragOverShiftId(null);
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const { staffId, sourceShiftId } = JSON.parse(raw);
      if (!staffId) return;

      // If moved from another shift, remove from source first
      if (sourceShiftId && sourceShiftId !== targetShiftId) {
        removeStaffFromShift(sourceShiftId, staffId);
      }

      // Assign to target shift
      assignStaffToShift(targetShiftId, staffId);

      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      } catch {}
    } catch (err) {
      console.error('Drag and drop error:', err);
    } finally {
      setDraggedStaffId(null);
      setDragSourceShiftId(null);
    }
  };

  const handleDropOnStaffDock = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverStaffDock(false);
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const { staffId, sourceShiftId } = JSON.parse(raw);
      if (staffId && sourceShiftId) {
        removeStaffFromShift(sourceShiftId, staffId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDraggedStaffId(null);
      setDragSourceShiftId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Roster Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Week Title & Status */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{roster.name}</h2>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  roster.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {roster.status}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Week of Oct 5 – Oct 11, 2026 • {roster.shifts.length} Total Scheduled Shifts
            </div>
          </div>

          {/* View Mode Toggle: Day First -> Week -> Month */}
          <div className="flex rounded-xl bg-slate-100 border border-slate-200 p-1">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Day View</span>
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="h-3.5 w-3.5" />
              <span>Weekly Grid</span>
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Monthly</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Weekly Table PDF Button */}
          <button
            onClick={() => {
              try {
                exportWeeklyRosterPdf({
                  roster,
                  business: currentBusiness,
                  staffList,
                  includeCosts: true,
                  filterStaffId: 'all',
                  layout: 'both'
                });
                confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
              } catch (err) {
                console.error('PDF export error:', err);
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition-colors"
            title="Download Weekly Table PDF (Matrix & Daily Schedule)"
          >
            <FileText className="h-4 w-4 text-red-600" />
            <span>Weekly PDF</span>
          </button>

          {/* Export Options & Calendar Sync */}
          <button
            onClick={() => onOpenExportModal?.()}
            className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition-colors"
            title="Export Options: Weekly PDF, Apple Calendar, Google Calendar, Outlook (.ics)"
          >
            <DownloadDoneIcon size={16} color="#2563eb" />
            <span>Export / Sync</span>
          </button>

          {/* Shift Template Settings */}
          {activeRole === 'owner' && (
            <button
              onClick={() => onOpenTemplateModal?.()}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition-colors"
              title="Configure and manage reusable shift templates"
            >
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              <span>Shift Templates ({templates.length})</span>
            </button>
          )}

          {/* AI Generate Hero Button */}
          {activeRole === 'owner' && (
            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
            >
              <SparkleAiIcon size={16} color="#FDE047" />
              <span>✨ AI Roster</span>
            </button>
          )}

          {/* Add Shift Button */}
          {activeRole === 'owner' && (
            <button
              onClick={() => onOpenShiftEditModal(undefined, selectedDay)}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Add Shift</span>
            </button>
          )}

          {/* Publish Roster Button */}
          {activeRole === 'owner' && (
            roster.status === 'draft' ? (
              <button
                onClick={handlePublish}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
              >
                <AnimatedSendIcon size={16} color="white" />
                <span>Publish</span>
              </button>
            ) : (
              <button
                onClick={unpublishRoster}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              >
                Revert to Draft
              </button>
            )
          )}
        </div>
      </div>

      {/* Reusable Shift Presets Bar */}
      {activeRole === 'owner' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Reusable Shift Presets
                </h3>
                <p className="text-[11px] text-slate-500">
                  Quickly add standard pre-configured shifts to your schedule
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Selected Day: <span className="font-bold text-slate-800">{currentDayInfo.label}</span>
            </div>
          </div>

          {/* Presets Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {SHIFT_PRESETS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`group relative p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{preset.icon}</span>
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: preset.color }}
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">{preset.name}</div>
                  <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between mt-0.5">
                    <span>{preset.startTime}–{preset.endTime}</span>
                    <span className="font-semibold text-emerald-700">€{preset.hourlyRate}</span>
                  </div>

                  {/* Add preset to currently selected day */}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPreset(preset);
                        handleAddPresetShift(selectedDay, preset);
                      }}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      title={`Add ${preset.name} to ${currentDayInfo.label}`}
                    >
                      <Plus className="h-3 w-3" />
                      <span>+ Add to {selectedDay.toUpperCase()}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Strategy Rationale Banner */}
      {roster.aiNotes && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-2xs">
          <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-blue-900">AI Scheduling Rationale: </span>
            <span className="text-slate-700">{roster.aiNotes}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DAY VIEW (PRIMARY / DEFAULT)                                          */}
      {/* ========================================================================= */}
      {viewMode === 'daily' && (
        <div className="space-y-5">
          {/* Day Navigation & Quick Day Pills */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Day Arrows & Date Title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevDay}
                    title="Previous day"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextDay}
                    title="Next day"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSelectedDay('mon')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    Today
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{currentDayInfo.fullDate}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        totalDayAssigned >= totalDayRequired && totalDayRequired > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : totalDayRequired === 0
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {totalDayRequired === 0
                        ? 'No shifts'
                        : totalDayAssigned >= totalDayRequired
                        ? `Covered (${totalDayAssigned}/${totalDayRequired})`
                        : `Open Positions (${totalDayAssigned}/${totalDayRequired})`}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Day Schedule Grid • Drag & drop staff to assign instantly
                  </p>
                </div>
              </div>

              {/* 7-Day Quick Switcher Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                {days.map(d => {
                  const shiftsCount = roster.shifts.filter(s => s.day === d.key).length;
                  const isSelected = selectedDay === d.key;
                  return (
                    <button
                      key={d.key}
                      onClick={() => setSelectedDay(d.key)}
                      className={`flex flex-col items-center min-w-[62px] px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wider">{d.key}</span>
                      <span className="text-sm font-bold my-0.5">{d.dateNum}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? 'bg-blue-700/80 text-blue-100'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {shiftsCount} {shiftsCount === 1 ? 'shift' : 'shifts'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* DAY GRID SWITCHER & CONTROLS BAR — Moved above the grid               */}
          {/* ======================================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <LayoutGrid className="h-4 w-4 text-blue-600" />
                <span>Day Grid View:</span>
              </span>

              <div className="flex rounded-xl bg-slate-100 border border-slate-200 p-1 text-xs">
                <button
                  onClick={() => setDayViewStyle('square')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                    dayViewStyle === 'square'
                      ? 'bg-white text-blue-700 shadow-2xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Square Grid (Drag & Drop)</span>
                </button>
                <button
                  onClick={() => setDayViewStyle('timeline')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                    dayViewStyle === 'timeline'
                      ? 'bg-white text-blue-700 shadow-2xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Columns3 className="h-3.5 w-3.5" />
                  <span>Hourly Timeline Grid</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeRole === 'owner' && (
                <>
                  <button
                    onClick={handleQuickSaveTodayAsTemplate}
                    disabled={dayShifts.length === 0}
                    className="flex items-center gap-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors disabled:opacity-50"
                    title="Save today's shift layout as a template"
                  >
                    <BookmarkCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span>Save as Template</span>
                  </button>

                  <button
                    onClick={() => onOpenShiftEditModal(undefined, selectedDay)}
                    className="flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Shift</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ======================================================================= */}
          {/* DAY GRID LAYOUT 1: SQUARE TILES GRID WITH DRAG & DROP  ← NOW ON TOP  */}
          {/* ======================================================================= */}
          {dayViewStyle === 'square' && (
            <div className="space-y-4">
              {dayShifts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No shifts scheduled for {currentDayInfo.fullDate}</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Create square shift blocks or pick a preset below, then drag team members onto them.
                  </p>
                  {activeRole === 'owner' && (
                    <button
                      onClick={() => onOpenShiftEditModal(undefined, selectedDay)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Shift</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {dayShifts.map(shift => {
                    const duration = calculateShiftHours(shift.startTime, shift.endTime);
                    const estWage = (duration * shift.hourlyRate).toFixed(2);
                    const isUnderstaffed = shift.assignedStaffIds.length < shift.requiredCount;
                    const isMyShift = shift.assignedStaffIds.includes(activeStaffId);
                    const isDragOver = dragOverShiftId === shift.id;

                    return (
                      <div
                        key={shift.id}
                        onDragOver={(e) => handleDragOverShift(e, shift.id)}
                        onDragLeave={(e) => handleDragLeaveShift(e, shift.id)}
                        onDrop={(e) => handleDropOnShift(e, shift.id)}
                        className={`group relative rounded-2xl border flex flex-col justify-between p-4 min-h-[260px] aspect-square transition-all ${
                          isDragOver
                            ? 'border-blue-600 ring-4 ring-blue-200 bg-blue-50/90 scale-[1.02] shadow-lg'
                            : isMyShift && activeRole === 'staff'
                            ? 'border-blue-400 bg-blue-50/60 ring-2 ring-blue-100 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                        }`}
                      >
                        {/* Top of Square Card */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-2">
                            <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Clock className="h-3 w-3 text-blue-600" />
                              {shift.startTime} – {shift.endTime} ({duration}h)
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold px-1.5 py-0.5 rounded-full text-[10px] ${
                                  isUnderstaffed
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {shift.assignedStaffIds.length}/{shift.requiredCount} Staff
                              </span>
                              {activeRole === 'owner' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteShift(shift.id);
                                  }}
                                  title="Delete Shift"
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug truncate mb-1">
                            {shift.title}
                          </h4>
                        </div>

                        {/* Center: The Drop Zone & Assigned Staff List */}
                        <div className="my-auto py-2 space-y-2">
                          {shift.assignedStaffIds.length === 0 ? (
                            <div className={`rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                              isDragOver
                                ? 'border-blue-500 bg-blue-100/50 text-blue-800'
                                : 'border-amber-200 bg-amber-50/40 text-amber-800'
                            }`}>
                              <UserPlus className={`mx-auto h-6 w-6 mb-1 ${isDragOver ? 'text-blue-600 animate-bounce' : 'text-amber-500'}`} />
                              <div className="text-xs font-bold">
                                {isDragOver ? 'Drop to Assign!' : 'Drop Staff Here'}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Needs {shift.requiredCount} staff
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {shift.assignedStaffIds.map(stId => {
                                const staff = staffList.find(s => s.id === stId);
                                if (!staff) return null;
                                const explanation = shift.aiExplanation?.[stId];
                                const attendance = attendanceRecords.find(
                                  a => a.staffId === stId && a.shiftId === shift.id
                                );

                                return (
                                  <div
                                    key={stId}
                                    draggable={activeRole === 'owner'}
                                    onDragStart={(e) => handleDragStart(e, stId, shift.id)}
                                    className="flex items-center justify-between gap-1.5 rounded-xl border border-slate-200 bg-slate-50/90 p-2 text-xs hover:bg-white transition-all cursor-grab active:cursor-grabbing group/staff"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <GripVertical className="h-3 w-3 text-slate-300 group-hover/staff:text-blue-600 shrink-0" />
                                      <img
                                        src={staff.avatar}
                                        alt={staff.name}
                                        className="h-6 w-6 rounded-full object-cover shrink-0 border border-slate-200"
                                      />
                                      <div className="truncate">
                                        <span className="font-semibold text-slate-900 truncate block text-[11px] leading-tight">
                                          {staff.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block leading-tight">
                                          {attendance?.checkIn ? `In @ ${attendance.checkIn}` : staff.jobTitle}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      {explanation && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAiReason({ shift, staffId: stId });
                                          }}
                                          title="AI Assignment Rationale"
                                          className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
                                        >
                                          <Sparkles className="h-3 w-3" />
                                        </button>
                                      )}

                                      {activeRole === 'owner' && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeStaffFromShift(shift.id, stId);
                                          }}
                                          title="Remove from shift"
                                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* If understaffed but has some staff: small drop prompt */}
                              {isUnderstaffed && (
                                <div className={`rounded-lg border border-dashed py-1.5 px-2 text-center text-[10px] font-semibold transition-all ${
                                  isDragOver
                                    ? 'border-blue-500 bg-blue-100/50 text-blue-800'
                                    : 'border-slate-200 bg-slate-50 text-slate-400'
                                }`}>
                                  + Drop another staff member
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom of Square Card */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div>
                            <span className="font-mono text-emerald-700 font-bold">€{shift.hourlyRate.toFixed(2)}/h</span>
                            <span className="text-slate-400 block text-[10px]">Est. €{estWage}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {activeRole === 'staff' && isMyShift && (
                              <button
                                onClick={() => onOpenSwapModal(shift)}
                                className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200"
                              >
                                Swap
                              </button>
                            )}

                            {activeRole === 'owner' && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteShift(shift.id);
                                  }}
                                  className="flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                                  title="Delete this shift"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Delete</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenShiftEditModal(shift)}
                                  className="font-semibold text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                  Edit →
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================================= */}
          {/* DRAGGABLE STAFF TRAY / DOCK  — Below the grid for easy reference       */}
          {/* ======================================================================= */}
          {activeRole === 'owner' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsOverStaffDock(true); }}
              onDragLeave={() => setIsOverStaffDock(false)}
              onDrop={handleDropOnStaffDock}
              className={`rounded-2xl border p-4 transition-all ${
                isOverStaffDock
                  ? 'border-rose-400 bg-rose-50/70 ring-2 ring-rose-200'
                  : 'border-slate-200 bg-white shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                    <Move className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Available Staff • Drag & Drop to Assign
                  </h4>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Drag any member onto a shift tile above</span>
                </div>
              </div>

              {/* Staff Cards Ribbon */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {staffList.map(staff => {
                  const isScheduledToday = dayShifts.some(s => s.assignedStaffIds.includes(staff.id));
                  const isBeingDragged = draggedStaffId === staff.id;
                  return (
                    <div
                      key={staff.id}
                      draggable={activeRole === 'owner'}
                      onDragStart={(e) => handleDragStart(e, staff.id)}
                      onDragEnd={() => { setDraggedStaffId(null); setDragSourceShiftId(null); }}
                      className={`group flex items-center gap-2 rounded-xl border p-2 bg-slate-50/90 hover:bg-white transition-all cursor-grab active:cursor-grabbing select-none shrink-0 ${
                        isBeingDragged
                          ? 'opacity-40 border-blue-400 scale-95'
                          : 'border-slate-200 hover:border-blue-400 hover:shadow-xs'
                      }`}
                    >
                      <GripVertical className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600" />
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="h-7 w-7 rounded-full object-cover border border-slate-200"
                      />
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <span>{staff.name}</span>
                          {isScheduledToday && (
                            <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1 rounded">
                              Assigned
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          €{staff.hourlyRate}/h • {staff.jobTitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily KPI Summary Cards — Summary at the bottom */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Shifts Today</span>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{dayShifts.length} Shifts</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {totalDayAssigned} of {totalDayRequired} staff positions filled
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Staff On Duty</span>
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{uniqueStaffIdsToday.length} Active</div>
              <div className="flex items-center gap-1 mt-1">
                {uniqueStaffIdsToday.slice(0, 4).map(stId => {
                  const staff = staffList.find(s => s.id === stId);
                  if (!staff) return null;
                  return (
                    <img
                      key={stId}
                      src={staff.avatar}
                      alt={staff.name}
                      title={staff.name}
                      className="h-5 w-5 rounded-full object-cover border border-white -ml-1 first:ml-0"
                    />
                  );
                })}
                {uniqueStaffIdsToday.length > 4 && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    +{uniqueStaffIdsToday.length - 4}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Hours</span>
                <Briefcase className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalDayHours} hrs</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Scheduled work duration across all shifts
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Estimated Cost</span>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700">€{totalDayWageCost.toFixed(2)}</div>
              <div className="text-[11px] text-slate-500 mt-1">Sum of staff hourly rates</div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* DAY GRID LAYOUT 2: HOURLY TIMELINE MATRIX (STAFF VS TIME)              */}
          {/* ======================================================================= */}
          {dayViewStyle === 'timeline' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Staff Schedule Matrix • {currentDayInfo.label} (07:00 – 22:00)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Hover or click any shift bar to inspect coverage details and assignments
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {dayShifts.length} {dayShifts.length === 1 ? 'Shift' : 'Shifts'} Active
                </span>
              </div>

              {dayShifts.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No shifts scheduled for {currentDayInfo.fullDate}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    {/* Grid Column Headers (Hours) */}
                    <div className="grid grid-cols-[220px_repeat(16,1fr)] bg-slate-50 border-b border-slate-200 text-[11px] font-mono font-bold text-slate-600 py-2.5 px-3">
                      <div className="text-slate-800 uppercase tracking-wider font-sans font-bold">
                        Staff Member
                      </div>
                      {timelineHours.map(hour => (
                        <div key={hour} className="text-center">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                      ))}
                    </div>

                    {/* Unassigned Shifts Row (if any) */}
                    {unassignedShifts.length > 0 && (
                      <div className="grid grid-cols-[220px_repeat(16,1fr)] border-b border-amber-100 bg-amber-50/40 p-3 items-center">
                        <div className="flex items-center gap-2 pr-2">
                          <div className="p-1.5 rounded-full bg-amber-100 text-amber-700">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-amber-900">Open Shifts</div>
                            <div className="text-[10px] text-amber-700">
                              {unassignedShifts.length} {unassignedShifts.length === 1 ? 'position' : 'positions'} unassigned
                            </div>
                          </div>
                        </div>

                        {/* Interactive Timeline bar for unassigned shifts */}
                        <div className="col-span-16 relative h-10 bg-amber-100/30 rounded-xl border border-amber-200/60 p-1">
                          {unassignedShifts.map(sh => {
                            const [shH] = sh.startTime.split(':').map(Number);
                            const [ehH] = sh.endTime.split(':').map(Number);
                            const startH = Math.max(shH, 7);
                            const endH = Math.min(ehH < shH ? ehH + 24 : ehH, 22);
                            const leftPct = Math.max(0, ((startH - 7) / 15) * 100);
                            const widthPct = Math.max(8, ((endH - startH) / 15) * 100);

                            return (
                              <div
                                key={sh.id}
                                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                onClick={() => activeRole === 'owner' && onOpenShiftEditModal(sh)}
                                className="absolute top-1 bottom-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-2 flex items-center justify-between shadow-2xs cursor-pointer"
                              >
                                <span className="truncate">{sh.title} ({sh.startTime}–{sh.endTime})</span>
                                <span className="text-[9px] bg-white/20 px-1 py-0.5 rounded font-mono ml-1">
                                  Assign
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Staff Rows */}
                    {scheduledStaffMembers.map(staff => {
                      const staffShifts = dayShifts.filter(s => s.assignedStaffIds.includes(staff.id));
                      const staffHours = staffShifts.reduce((acc, s) => acc + calculateShiftHours(s.startTime, s.endTime), 0);
                      const staffCost = staffShifts.reduce((acc, s) => acc + calculateShiftHours(s.startTime, s.endTime) * s.hourlyRate, 0);

                      return (
                        <div
                          key={staff.id}
                          className="grid grid-cols-[220px_repeat(16,1fr)] border-b border-slate-100 hover:bg-slate-50/50 p-3 items-center transition-colors"
                        >
                          {/* Staff Info Column */}
                          <div className="flex items-center gap-2.5 pr-2">
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 truncate">{staff.name}</div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {staffHours} hrs • €{staffCost.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          {/* Timeline Bar Track */}
                          <div className="col-span-16 relative h-10 bg-slate-50/60 rounded-xl border border-slate-100 p-1">
                            {staffShifts.map(sh => {
                              const [shH] = sh.startTime.split(':').map(Number);
                              const [ehH] = sh.endTime.split(':').map(Number);
                              const startH = Math.max(shH, 7);
                              const endH = Math.min(ehH < shH ? ehH + 24 : ehH, 22);
                              const leftPct = Math.max(0, ((startH - 7) / 15) * 100);
                              const widthPct = Math.max(8, ((endH - startH) / 15) * 100);

                              const isMyShift = sh.assignedStaffIds.includes(activeStaffId);

                              return (
                                <div
                                  key={sh.id}
                                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                  onClick={() => activeRole === 'owner' && onOpenShiftEditModal(sh)}
                                  className={`absolute top-1 bottom-1 rounded-lg px-2.5 flex items-center justify-between text-xs font-semibold text-white shadow-2xs cursor-pointer transition-all ${
                                    isMyShift && activeRole === 'staff'
                                      ? 'bg-blue-700 ring-2 ring-blue-300'
                                      : 'bg-blue-600 hover:bg-blue-700'
                                  }`}
                                >
                                  <span className="truncate font-bold text-[11px]">
                                    {sh.title} ({sh.startTime}–{sh.endTime})
                                  </span>
                                  <span className="text-[10px] font-mono bg-white/20 px-1 py-0.5 rounded shrink-0 ml-1">
                                    €{sh.hourlyRate}/h
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Hourly Coverage Tally Footer */}
                    <div className="grid grid-cols-[220px_repeat(16,1fr)] bg-slate-50/80 p-3 items-center border-t border-slate-200">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Staff On Duty:
                      </div>

                      {timelineHours.map(hour => {
                        const count = getStaffCountForHour(hour);
                        return (
                          <div key={hour} className="text-center">
                            <span
                              className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                count >= 2
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : count === 1
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WEEKLY GRID VIEW                                                      */}
      {/* ========================================================================= */}
      {viewMode === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {days.map(dayInfo => {
            const dayShifts = roster.shifts.filter(s => s.day === dayInfo.key);
            const totalRequired = dayShifts.reduce((acc, s) => acc + s.requiredCount, 0);
            const totalAssigned = dayShifts.reduce((acc, s) => acc + s.assignedStaffIds.length, 0);
            const isFullCoverage = totalAssigned >= totalRequired;

            return (
              <div
                key={dayInfo.key}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs min-h-[500px]"
              >
                {/* Day Header - Clickable to switch directly to Day View! */}
                <div
                  onClick={() => {
                    setSelectedDay(dayInfo.key);
                    setViewMode('daily');
                  }}
                  className="group flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 cursor-pointer"
                  title="Click to view daily schedule"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      {dayInfo.label}
                    </div>
                    <div className="text-[11px] text-blue-600 font-mono font-medium">Oct {dayInfo.dateNum}</div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isFullCoverage
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {totalAssigned}/{totalRequired}
                  </span>
                </div>

                {/* Shifts List */}
                <div className="space-y-2.5 flex-1">
                  {dayShifts.map(shift => {
                    const duration = calculateShiftHours(shift.startTime, shift.endTime);
                    const isUnderstaffed = shift.assignedStaffIds.length < shift.requiredCount;
                    const isMyShift = shift.assignedStaffIds.includes(activeStaffId);

                    return (
                      <div
                        key={shift.id}
                        onClick={() => activeRole === 'owner' && onOpenShiftEditModal(shift)}
                        className={`group relative rounded-xl border p-3 transition-all ${
                          isMyShift && activeRole === 'staff'
                            ? 'border-blue-400 bg-blue-50/70 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-2xs'
                        } ${activeRole === 'owner' ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-semibold text-blue-700 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-blue-600" />
                            {shift.startTime} – {shift.endTime}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-emerald-700 font-semibold">€{shift.hourlyRate.toFixed(2)}</span>
                            {activeRole === 'owner' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteShift(shift.id);
                                }}
                                title="Delete shift"
                                className="p-0.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-xs font-bold text-slate-900 leading-snug mb-2">
                          {shift.title}
                        </div>

                        <div className="flex items-center justify-between text-[10px] mb-2 text-slate-500">
                          <span>Positions:</span>
                          <span className={`font-bold ${isUnderstaffed ? 'text-amber-600' : 'text-slate-700'}`}>
                            {shift.assignedStaffIds.length} / {shift.requiredCount}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {shift.assignedStaffIds.map(stId => {
                            const staff = staffList.find(s => s.id === stId);
                            if (!staff) return null;
                            const explanation = shift.aiExplanation?.[stId];

                            return (
                              <div
                                key={stId}
                                onClick={e => {
                                  e.stopPropagation();
                                  if (explanation) {
                                    setSelectedAiReason({ shift, staffId: stId });
                                  }
                                }}
                                className="flex items-center justify-between gap-1.5 rounded-lg bg-slate-50 border border-slate-200 p-1.5 text-[11px] text-slate-800 hover:border-slate-300"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <img
                                    src={staff.avatar}
                                    alt={staff.name}
                                    className="h-4 w-4 rounded-full object-cover shrink-0"
                                  />
                                  <span className="truncate font-medium">{staff.name}</span>
                                </div>

                                {explanation && (
                                  <span
                                    title="Click to view AI reasoning"
                                    className="shrink-0 flex items-center text-[10px] text-blue-600 hover:text-blue-800"
                                  >
                                    <Sparkles className="h-3 w-3" />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {activeRole === 'owner' && (
                    <button
                      onClick={() => onOpenShiftEditModal(undefined, dayInfo.key)}
                      className="w-full flex items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 py-2 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MONTHLY CALENDAR VIEW                                                 */}
      {/* ========================================================================= */}
      {viewMode === 'monthly' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              October 2026 Month View
            </h3>
            <span className="text-xs text-slate-500 font-medium">Click any day to view daily schedule</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-2 mt-2">
            {monthDays.map(dayNum => {
              const isCurrentRosterWeek = dayNum >= 5 && dayNum <= 11;
              const dayKeys: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
              const dayOfWeekKey = dayKeys[(dayNum - 5 + 70) % 7];

              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    if (isCurrentRosterWeek) {
                      setSelectedDay(dayOfWeekKey);
                      setViewMode('daily');
                    }
                  }}
                  className={`h-20 rounded-xl border p-2 text-left cursor-pointer transition-all ${
                    isCurrentRosterWeek
                      ? 'border-blue-300 bg-blue-50/70 shadow-2xs hover:border-blue-500 hover:bg-blue-100/50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isCurrentRosterWeek ? 'text-blue-800' : 'text-slate-600'}`}>
                      {dayNum}
                    </span>
                    {isCurrentRosterWeek && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">
                    {isCurrentRosterWeek ? (
                      <span className="inline-block rounded bg-blue-100 px-1 py-0.5 text-blue-800 font-mono font-bold">
                        {roster.shifts.filter(s => s.day === dayOfWeekKey).length} Shifts
                      </span>
                    ) : (
                      <span className="text-slate-400">Regular</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Decision Reasoning Modal / Drawer */}
      {selectedAiReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <button
              onClick={() => setSelectedAiReason(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                AI Assignment Rationale
              </h3>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-3 text-xs">
              <div className="text-slate-500">Shift:</div>
              <div className="font-bold text-slate-900 text-sm">{selectedAiReason.shift.title}</div>
              <div className="text-blue-700 font-medium text-[11px] mt-0.5">
                {selectedAiReason.shift.day.toUpperCase()} • {selectedAiReason.shift.startTime} – {selectedAiReason.shift.endTime}
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs leading-relaxed text-slate-800">
              <div className="font-semibold text-blue-900 mb-1">Why this staff member was picked:</div>
              {selectedAiReason.shift.aiExplanation?.[selectedAiReason.staffId]}
            </div>

            <button
              onClick={() => setSelectedAiReason(null)}
              className="mt-4 w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2 text-xs font-semibold text-white transition-colors shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
