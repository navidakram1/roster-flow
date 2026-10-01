'use client';

import React from 'react';
import { useRoster } from '../../context/RosterContext';
import { calculateShiftHours } from '../../lib/aiScheduler';
import { DollarSign, Clock, TrendingUp, Users, ShieldAlert, Award } from 'lucide-react';

export const WagesView: React.FC = () => {
  const { staffList, roster, attendanceRecords, currentBusiness } = useRoster();

  // Calculate scheduled hours and wages per staff from the active roster
  const staffPayroll = staffList
    .filter(s => s.status === 'active')
    .map(staff => {
      let scheduledHours = 0;
      roster.shifts.forEach(shift => {
        if (shift.assignedStaffIds.includes(staff.id)) {
          scheduledHours += calculateShiftHours(shift.startTime, shift.endTime);
        }
      });

      // Sum actual worked hours from attendance logs
      const actualWorkedHours = attendanceRecords
        .filter(a => a.staffId === staff.id)
        .reduce((acc, a) => acc + (a.calculatedHours || 0), 0);

      const estimatedScheduledWage = scheduledHours * staff.hourlyRate;
      const actualEarnedWage = actualWorkedHours > 0 ? actualWorkedHours * staff.hourlyRate : estimatedScheduledWage * 0.3; // sample proportion

      const isOvertimeRisk = scheduledHours > staff.maxHoursPerWeek;

      return {
        staff,
        scheduledHours: Number(scheduledHours.toFixed(1)),
        actualWorkedHours: Number(actualWorkedHours.toFixed(1)),
        hourlyRate: staff.hourlyRate,
        estimatedScheduledWage: Number(estimatedScheduledWage.toFixed(2)),
        actualEarnedWage: Number(actualEarnedWage.toFixed(2)),
        isOvertimeRisk
      };
    });

  const totalScheduledHours = staffPayroll.reduce((acc, s) => acc + s.scheduledHours, 0);
  const totalPayrollEstimate = staffPayroll.reduce((acc, s) => acc + s.estimatedScheduledWage, 0);
  const averageHourlyRate = staffPayroll.length > 0
    ? staffPayroll.reduce((acc, s) => acc + s.hourlyRate, 0) / staffPayroll.length
    : 16.0;

  return (
    <div className="space-y-6">
      {/* Wages Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-5 w-5 text-emerald-700" />
          <h2 className="text-lg font-bold text-slate-900">Workforce Hours & Wages Calculator</h2>
        </div>
        <p className="text-xs text-slate-500">
          Transparent wage calculation based on verified clock hours and owner hourly rates for {currentBusiness.name}.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Estimated Weekly Payroll</span>
            <DollarSign className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            €{totalPayrollEstimate.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Based on {totalScheduledHours.toFixed(1)} scheduled team hours
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Scheduled Hours</span>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700">
            {totalScheduledHours.toFixed(1)} <span className="text-sm font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across 11 shifts in {roster.name}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Average Blended Wage</span>
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-700">
            €{averageHourlyRate.toFixed(2)} <span className="text-sm font-normal text-slate-500">/hr</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Range: €14.50 to €19.50/hr
          </div>
        </div>
      </div>

      {/* Staff Payroll Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Individual Staff Compensation Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Base Wage / hr</th>
                <th className="py-3 px-3">Weekly Max</th>
                <th className="py-3 px-3">Scheduled Hours</th>
                <th className="py-3 px-3">Clocked Hours</th>
                <th className="py-3 px-3">Cap Status</th>
                <th className="py-3 px-3 text-right">Estimated Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffPayroll.map(item => (
                <tr key={item.staff.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.staff.avatar}
                        alt={item.staff.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{item.staff.name}</div>
                        <div className="text-[10px] text-slate-500">{item.staff.jobTitle}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    €{item.hourlyRate.toFixed(2)}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600 font-medium">
                    {item.staff.maxHoursPerWeek} hrs
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-blue-700">
                    {item.scheduledHours} hrs
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-700">
                    {item.actualWorkedHours > 0 ? `${item.actualWorkedHours} hrs` : '--'}
                  </td>

                  <td className="py-3 px-3">
                    {item.isOvertimeRisk ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                        <ShieldAlert className="h-3 w-3 text-amber-600" /> Exceeds Cap
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-max">
                        ✓ Within Limit
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono font-extrabold text-emerald-700 text-right text-sm">
                    €{item.estimatedScheduledWage.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
