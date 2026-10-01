'use client';

import React, { useState, useEffect } from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  StopCircle,
  Coffee,
  DollarSign,
  UserCheck
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    attendanceRecords,
    activeAttendance,
    checkInStaff,
    toggleBreakStaff,
    checkOutStaff,
    activeStaffId,
    currentStaffProfile,
    roster,
    staffList,
    activeRole
  } = useRoster();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Today's shift for active staff
  const todayShift = roster.shifts.find(s => s.day === 'mon' && s.assignedStaffIds.includes(activeStaffId))
    || roster.shifts[0];

  return (
    <div className="space-y-6">
      {/* Active Time Clock Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <Clock className="h-4 w-4" />
              <span>Real-Time Time Clock & Attendance</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {currentStaffProfile?.name || 'Staff Member'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Scheduled Shift: <span className="text-blue-700 font-semibold">{todayShift.title}</span> ({todayShift.startTime} – {todayShift.endTime})
            </p>
          </div>

          {/* Digital Clock Display & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-center shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Local Workplace Time</div>
              <div className="font-mono text-2xl md:text-3xl font-bold text-blue-700 tracking-wider">
                {currentTime || '12:00:00'}
              </div>
            </div>

            {/* Clock action button */}
            {!activeAttendance ? (
              <button
                onClick={() => checkInStaff(activeStaffId, todayShift.id)}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 py-4 text-sm font-bold text-white shadow-sm transition-all"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>CHECK IN NOW</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBreakStaff(activeAttendance.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-3 text-xs font-semibold transition-all border ${
                    activeAttendance.status === 'on_break'
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Coffee className="h-4 w-4" />
                  <span>{activeAttendance.status === 'on_break' ? 'Resume Work' : 'Start 15m Break'}</span>
                </button>

                <button
                  onClick={() => checkOutStaff(activeAttendance.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-3 text-xs font-bold text-white shadow-sm transition-all"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>CHECK OUT</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active shift banner */}
        {activeAttendance && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600 animate-ping" />
              <span>Shift active since {activeAttendance.checkIn}</span>
              {activeAttendance.breakMinutes > 0 && (
                <span className="text-amber-700">({activeAttendance.breakMinutes}m break taken)</span>
              )}
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Rate: €{(currentStaffProfile?.hourlyRate || 15).toFixed(2)}/hr • Wage running live
            </div>
          </div>
        )}
      </div>

      {/* Attendance Exceptions & Flag Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">On-Time Accuracy</div>
          <div className="text-2xl font-bold text-emerald-700">92.4%</div>
          <div className="text-[11px] text-slate-400 mt-1">Based on scheduled start vs check-in</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-2xs">
          <div className="text-xs font-semibold text-amber-800 mb-1">Late Exceptions Logged</div>
          <div className="text-2xl font-bold text-amber-800">1 Incident</div>
          <div className="text-[11px] text-amber-700/80 mt-1">John Doe +14m past 15:00 shift start</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Total Hours Tracked</div>
          <div className="text-2xl font-bold text-blue-700">19.24 hrs</div>
          <div className="text-[11px] text-slate-400 mt-1">€321.46 accumulated payroll verified</div>
        </div>
      </div>

      {/* Attendance Records Log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Daily Attendance & Timecard Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Date & Shift</th>
                <th className="py-3 px-3">Scheduled</th>
                <th className="py-3 px-3">Clock In / Out</th>
                <th className="py-3 px-3">Break</th>
                <th className="py-3 px-3">Worked Hours</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Earned Wage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceRecords.map(record => {
                const staff = staffList.find(s => s.id === record.staffId);
                const isLate = record.checkIn && record.checkIn > record.scheduledStart;

                return (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={staff?.avatar}
                          alt={staff?.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-800">{staff?.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{record.shiftTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{record.date}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {record.scheduledStart} – {record.scheduledEnd}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="text-slate-800">
                        {record.checkIn || '--:--'} → {record.checkOut || 'Active'}
                      </div>
                      {isLate && (
                        <span className="text-[10px] text-amber-700 font-medium flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" /> Late arrival
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {record.breakMinutes} mins
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {record.calculatedHours} hrs
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          record.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : record.status === 'checked_in'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-right">
                      €{record.calculatedWage.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
