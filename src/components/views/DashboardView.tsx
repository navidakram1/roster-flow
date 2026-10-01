'use client';

import React from 'react';
import { useRoster } from '../../context/RosterContext';
import { DayOfWeek } from '../../types';
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  CheckSquare,
  ArrowRightLeft,
  ChevronRight,
  CalendarRange,
  ShieldCheck,
  UserCheck,
  Plus,
  Play,
  Square,
  Activity,
  Layers,
  Zap,
  Briefcase,
  LayoutGrid,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SparkleAiIcon, DownloadDoneIcon, PlayPauseIcon, SuccessIcon } from '../ui/animated-state-icons';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAiModal: () => void;
  onOpenInviteModal: () => void;
  onOpenExportModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenAiModal,
  onOpenInviteModal,
  onOpenExportModal
}) => {
  const {
    currentBusiness,
    activeRole,
    staffList,
    roster,
    tasks,
    toggleTaskStatus,
    attendanceRecords,
    swapRequests,
    activeAttendance,
    checkInStaff,
    checkOutStaff,
    activeStaffId,
    currentStaffProfile,
    setSelectedDay,
    setViewMode
  } = useRoster();

  // Active staff metrics
  const activeStaffMembers = staffList.filter(s => s.status === 'active');
  const pendingApprovals = staffList.filter(s => s.status === 'pending_approval').length;
  const pendingSwaps = swapRequests.filter(s => s.status === 'pending_owner').length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const taskProgressPct = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Today's shifts (Monday Oct 5 is active demo day)
  const todayShifts = roster.shifts
    .filter(s => s.day === 'mon')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalRequiredToday = todayShifts.reduce((acc, s) => acc + s.requiredCount, 0);
  const totalAssignedToday = todayShifts.reduce((acc, s) => acc + s.assignedStaffIds.length, 0);
  const coveragePct = totalRequiredToday > 0 ? Math.round((totalAssignedToday / totalRequiredToday) * 100) : 100;

  // Currently clocked in staff
  const currentlyClockedIn = attendanceRecords.filter(a => a.status === 'checked_in');

  // Today's labor cost
  const calculateShiftHours = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMins = sh * 60 + sm;
    let endMins = eh * 60 + em;
    if (endMins < startMins) endMins += 24 * 60;
    return Number(((endMins - startMins) / 60).toFixed(1));
  };

  const totalHoursToday = todayShifts.reduce((acc, s) => {
    const hours = calculateShiftHours(s.startTime, s.endTime);
    return acc + hours * Math.max(s.assignedStaffIds.length, 1);
  }, 0);

  const totalWageCostToday = todayShifts.reduce((acc, s) => {
    const hours = calculateShiftHours(s.startTime, s.endTime);
    return acc + hours * s.hourlyRate * Math.max(s.assignedStaffIds.length, 1);
  }, 0);

  // Staff role specific: their shift today
  const myShiftToday = roster.shifts.find(s => s.day === 'mon' && s.assignedStaffIds.includes(activeStaffId));

  const daysList: { key: DayOfWeek; label: string; dateNum: number }[] = [
    { key: 'mon', label: 'Mon', dateNum: 5 },
    { key: 'tue', label: 'Tue', dateNum: 6 },
    { key: 'wed', label: 'Wed', dateNum: 7 },
    { key: 'thu', label: 'Thu', dateNum: 8 },
    { key: 'fri', label: 'Fri', dateNum: 9 },
    { key: 'sat', label: 'Sat', dateNum: 10 },
    { key: 'sun', label: 'Sun', dateNum: 11 }
  ];

  const handleJumpToDay = (dayKey: DayOfWeek) => {
    setSelectedDay(dayKey);
    setViewMode('daily');
    onNavigateTab('roster');
  };

  const handleClockIn = () => {
    if (myShiftToday) {
      checkInStaff(activeStaffId, myShiftToday.id);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER WITH WORKSPACE ROOM & ACTIONS                              */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-50/50 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            {/* Live Status Pill & Date */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs text-blue-800 font-bold">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span>{currentBusiness.name}</span>
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Monday, October 5, 2026 • Live Shift Operations</span>
              </span>
            </div>

            {/* Greeting */}
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              {activeRole === 'owner'
                ? 'Workforce Operations Hub 👋'
                : `Welcome back, ${currentStaffProfile?.name || 'Team Member'} 👋`}
            </h1>

            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              {activeRole === 'owner'
                ? `Today's schedule has ${todayShifts.length} shifts active with ${coveragePct}% coverage. ${pendingApprovals + pendingSwaps} operational items require your attention.`
                : myShiftToday
                ? `You are scheduled for today's ${myShiftToday.title} (${myShiftToday.startTime} – ${myShiftToday.endTime}). Clock in when you arrive on site.`
                : `You are not scheduled for any shifts today. Check your upcoming roster or request a shift swap.`}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {activeRole === 'owner' ? (
              <>
                <button
                  onClick={onOpenAiModal}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
                >
                  <SparkleAiIcon size={16} color="#FDE047" />
                  <span>AI Schedule Roster</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDay('mon');
                    setViewMode('daily');
                    onNavigateTab('roster');
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                >
                  <LayoutGrid className="h-4 w-4 text-blue-600" />
                  <span>Day Schedule</span>
                </button>

                <button
                  onClick={onOpenInviteModal}
                  className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                >
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Invite Link</span>
                </button>

                <button
                  onClick={onOpenExportModal}
                  className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                  title="Export Weekly Table PDF, Apple Calendar, Google Calendar, Outlook (.ics)"
                >
                  <DownloadDoneIcon size={16} color="#2563eb" />
                  <span>Export / PDF</span>
                </button>
              </>
            ) : (
              myShiftToday && (
                <div>
                  {activeAttendance ? (
                    <button
                      onClick={() => checkOutStaff(activeAttendance.id)}
                      className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-3 text-xs font-bold text-white shadow-md transition-all"
                    >
                      <PlayPauseIcon size={18} active={true} color="white" />
                      <span>Clock Out Now (On Shift)</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleClockIn}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-xs font-bold text-white shadow-md transition-all"
                    >
                      <PlayPauseIcon size={18} active={false} color="white" />
                      <span>Clock In For Today's Shift</span>
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS KPI TILES (4 CARDS WITH DETAILED GAUGES)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Shift Coverage */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Shift Coverage</span>
            <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <SuccessIcon size={18} color="#059669" active={coveragePct >= 100} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{coveragePct}%</span>
            <span className="text-xs font-semibold text-slate-500">
              ({totalAssignedToday}/{totalRequiredToday} Staff)
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${coveragePct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
              style={{ width: `${Math.min(coveragePct, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{todayShifts.length} shifts scheduled today</span>
            <span className="font-semibold text-emerald-700">Optimal</span>
          </div>
        </div>

        {/* KPI 2: Active On-Duty Now */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Clocked In Now</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700">
              {currentlyClockedIn.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Active on floor
            </span>
          </div>
          {/* Clocked staff avatars */}
          <div className="flex items-center gap-1 mt-3">
            {currentlyClockedIn.slice(0, 4).map(att => {
              const staff = staffList.find(s => s.id === att.staffId);
              if (!staff) return null;
              return (
                <img
                  key={att.id}
                  src={staff.avatar}
                  alt={staff.name}
                  title={`${staff.name} (In @ ${att.checkIn})`}
                  className="h-6 w-6 rounded-full object-cover border border-white -ml-1 first:ml-0 ring-1 ring-emerald-500"
                />
              );
            })}
            {currentlyClockedIn.length === 0 && (
              <span className="text-[11px] text-slate-400">Next shift start at 07:30</span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Real-time attendance tracking active
          </div>
        </div>

        {/* KPI 3: Daily Labor & Hours */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Labor Budget</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              €{totalWageCostToday.toFixed(0)}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({totalHoursToday} hrs)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>Avg €{(totalWageCostToday / Math.max(totalHoursToday, 1)).toFixed(2)}/h</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Within weekly labor allowance
          </div>
        </div>

        {/* KPI 4: Pending Action Items */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Action Items</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {pendingApprovals + pendingSwaps}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Pending review
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <button
              onClick={() => onNavigateTab('swaps')}
              className="text-amber-800 font-bold hover:underline"
            >
              {pendingSwaps} Shift Swaps
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => onNavigateTab('staff')}
              className="text-blue-700 font-bold hover:underline"
            >
              {pendingApprovals} Join Requests
            </button>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Requires manager approval
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MINI 7-DAY SCHEDULE STRIP                                             */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Weekly Roster Snapshot (Oct 5 – Oct 11, 2026)
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('roster')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Full Roster View</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2.5">
          {daysList.map(d => {
            const shiftsOnDay = roster.shifts.filter(s => s.day === d.key);
            const reqCount = shiftsOnDay.reduce((a, s) => a + s.requiredCount, 0);
            const filledCount = shiftsOnDay.reduce((a, s) => a + s.assignedStaffIds.length, 0);
            const isFull = filledCount >= reqCount && reqCount > 0;
            const isToday = d.key === 'mon';

            return (
              <div
                key={d.key}
                onClick={() => handleJumpToDay(d.key)}
                className={`group rounded-xl border p-3 text-center cursor-pointer transition-all ${
                  isToday
                    ? 'border-blue-400 bg-blue-50/70 shadow-2xs ring-1 ring-blue-200'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                }`}
                title={`Click to view ${d.label} day schedule`}
              >
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 group-hover:text-blue-600">
                  {d.label}
                </div>
                <div className={`text-base font-extrabold my-0.5 ${isToday ? 'text-blue-900' : 'text-slate-900'}`}>
                  {d.dateNum}
                </div>
                <div className="text-[10px] font-semibold text-slate-500">
                  {shiftsOnDay.length} {shiftsOnDay.length === 1 ? 'shift' : 'shifts'}
                </div>
                <div className="mt-1.5 flex justify-center">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isFull ? 'bg-emerald-500' : reqCount === 0 ? 'bg-slate-300' : 'bg-amber-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN WORKSPACE: TODAY'S SHIFTS & AI WORKFORCE ASSISTANT               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Active Shifts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Today's Scheduled Shifts ({todayShifts.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedDay('mon');
                  setViewMode('daily');
                  onNavigateTab('roster');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Open Day Grid</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {todayShifts.map(shift => {
                const duration = calculateShiftHours(shift.startTime, shift.endTime);
                const isUnderstaffed = shift.assignedStaffIds.length < shift.requiredCount;

                return (
                  <div
                    key={shift.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-2xs transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {shift.startTime} – {shift.endTime} ({duration}h)
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isUnderstaffed
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {shift.assignedStaffIds.length} / {shift.requiredCount} Staff
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">{shift.title}</h4>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-700 font-mono">
                          €{shift.hourlyRate.toFixed(2)}/h
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Est. €{(duration * shift.hourlyRate).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Assigned staff avatars and tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100">
                      {shift.assignedStaffIds.map(stId => {
                        const staff = staffList.find(s => s.id === stId);
                        if (!staff) return null;
                        const att = attendanceRecords.find(a => a.staffId === stId && a.shiftId === shift.id);

                        return (
                          <div
                            key={stId}
                            className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800"
                          >
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className="h-5 w-5 rounded-full object-cover border border-slate-200"
                            />
                            <span className="font-semibold text-slate-900">{staff.name}</span>
                            <span className="text-[10px] text-slate-400">({staff.jobTitle})</span>
                            {att?.checkIn && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                In @ {att.checkIn}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {isUnderstaffed && (
                        <button
                          onClick={() => {
                            setSelectedDay('mon');
                            setViewMode('daily');
                            onNavigateTab('roster');
                          }}
                          className="flex items-center gap-1 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Assign Staff</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Operational Priority Tasks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Today's Priority Checklist ({completedTasksCount}/{tasks.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Task Board</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Task list with live interactive checkbox toggle */}
            <div className="space-y-2.5">
              {tasks.slice(0, 4).map(task => {
                const assigned = staffList.find(s => s.id === task.assignedStaffId);
                const isDone = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isDone
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-4 w-4 rounded-md border flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white hover:border-blue-400'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Assigned to: <span className="font-semibold text-slate-700">{assigned?.name || 'Unassigned'}</span> • Due: {task.dueTime}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        task.priority === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Workforce Advisory & Deep Link */}
        <div className="space-y-5">
          {/* AI Workforce Operations Assistant */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                AI Workforce Intelligence
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Real-time audit & recommendations for your team:
            </p>

            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>Coverage Advisory: Friday Peak</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Friday Evening shift has 2 staff assigned (optimal: 3). Mike Vance is available with 8 hours headroom.
                </p>
                <button
                  onClick={() => onNavigateTab('roster')}
                  className="mt-2 text-[10px] font-bold text-amber-900 hover:underline flex items-center gap-1"
                >
                  <span>Resolve in Roster</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Alert 2 */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
                <div className="font-bold flex items-center gap-1.5 text-blue-800 mb-1">
                  <ArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span>Shift Swap Awaiting Approval</span>
                </div>
                <p className="text-[11px] text-blue-800/90 leading-relaxed">
                  John Doe requested David Kim to cover his Friday evening shift. Peer agreement accepted.
                </p>
                <button
                  onClick={() => onNavigateTab('swaps')}
                  className="mt-2 text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <span>Review Swap</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Alert 3 */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>Labor Compliance 100%</span>
                </div>
                <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                  All active staff are strictly within their weekly maximum hours caps. Zero overtime penalty risks detected.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Staff Room Deep Link Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Staff Room Deep Link
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Share link with new hires to join {currentBusiness.name}:
            </p>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-2 text-xs font-mono text-slate-800">
              <span className="truncate text-[11px]">rosterflow.app/join/{currentBusiness.inviteCode}</span>
              <button
                onClick={onOpenInviteModal}
                className="ml-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg transition-colors shadow-2xs shrink-0"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
