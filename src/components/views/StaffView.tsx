'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { StaffProfile, DayOfWeek } from '../../types';
import {
  Users,
  UserCheck,
  UserX,
  Share2,
  DollarSign,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Edit2,
  Plus
} from 'lucide-react';

interface StaffViewProps {
  onOpenInviteModal: () => void;
}

export const StaffView: React.FC<StaffViewProps> = ({ onOpenInviteModal }) => {
  const {
    staffList,
    updateStaffProfile,
    approveStaffJoin,
    rejectStaffJoin,
    currentBusiness,
    activeRole
  } = useRoster();

  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);

  const activeStaff = staffList.filter(s => s.status === 'active');
  const pendingStaff = staffList.filter(s => s.status === 'pending_approval');

  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const toggleAvailability = (staff: StaffProfile, day: DayOfWeek) => {
    const updated = {
      ...staff,
      availability: {
        ...staff.availability,
        [day]: !staff.availability[day]
      }
    };
    updateStaffProfile(updated);
  };

  const handleSaveStaffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      updateStaffProfile(editingStaff);
      setEditingStaff(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Room Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Staff Workplace Room & Deep Link</h2>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-800 border border-blue-200">
              {currentBusiness.inviteCode}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Staff can tap your deep link or scan the room QR code to create their profile, specify shift preferences, and apply for membership.
          </p>
        </div>

        <button
          onClick={onOpenInviteModal}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all"
        >
          <Share2 className="h-4 w-4" />
          <span>Generate Room Invite</span>
        </button>
      </div>

      {/* Pending Join Requests Queue */}
      {pendingStaff.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Pending Join Requests ({pendingStaff.length})</span>
          </div>

          <div className="space-y-3">
            {pendingStaff.map(applicant => (
              <div
                key={applicant.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={applicant.avatar}
                    alt={applicant.name}
                    className="h-10 w-10 rounded-full object-cover border border-amber-300"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{applicant.name}</div>
                    <div className="text-xs text-slate-500">
                      Applied via Deep Link • Proposed Role: <span className="text-amber-800 font-semibold">{applicant.jobTitle}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{applicant.email} • {applicant.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approveStaffJoin(applicant.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-2xs"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => rejectStaffJoin(applicant.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 px-3 py-1.5 text-xs font-medium transition-colors shadow-2xs"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Staff Directory */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Active Team Members ({activeStaff.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hourly wages, weekly hour limits, and day-by-day availability matrix.
            </p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Role & Skills</th>
                <th className="py-3 px-3">Wage / hr</th>
                <th className="py-3 px-3">Max Weekly</th>
                <th className="py-3 px-3">Preference</th>
                <th className="py-3 px-3 text-center">Availability (Mon – Sun)</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeStaff.map(staff => (
                <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Name & Avatar */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{staff.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{staff.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role & Skills */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{staff.jobTitle}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {staff.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.2 text-[9px] text-blue-700 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Hourly Wage */}
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                    €{staff.hourlyRate.toFixed(2)}/hr
                  </td>

                  {/* Max Hours */}
                  <td className="py-3 px-3 font-mono text-slate-600 font-medium">
                    {staff.maxHoursPerWeek}h / week
                  </td>

                  {/* Preferred shift */}
                  <td className="py-3 px-3">
                    <span className="capitalize text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      {staff.preferredShift}
                    </span>
                  </td>

                  {/* Interactive Mon-Sun Availability */}
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-1">
                      {days.map(d => {
                        const isAvail = staff.availability[d];
                        return (
                          <button
                            key={d}
                            onClick={() => toggleAvailability(staff, d)}
                            title={`${d.toUpperCase()}: ${isAvail ? 'Available' : 'Unavailable'} (Click to toggle)`}
                            className={`h-6 w-6 rounded text-[10px] font-bold uppercase transition-all ${
                              isAvail
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {d[0]}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setEditingStaff(staff)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Edit wage or limits"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setEditingStaff(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Staff Profile</h3>

            <form onSubmit={handleSaveStaffEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  value={editingStaff.name}
                  onChange={e => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Job Title / Role</label>
                <input
                  type="text"
                  value={editingStaff.jobTitle}
                  onChange={e => setEditingStaff({ ...editingStaff, jobTitle: e.target.value })}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hourly Wage (€/hr)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={editingStaff.hourlyRate}
                    onChange={e => setEditingStaff({ ...editingStaff, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Hours / Week</label>
                  <input
                    type="number"
                    value={editingStaff.maxHoursPerWeek}
                    onChange={e => setEditingStaff({ ...editingStaff, maxHoursPerWeek: parseInt(e.target.value, 10) || 0 })}
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Preferred Shift</label>
                <select
                  value={editingStaff.preferredShift}
                  onChange={e => setEditingStaff({ ...editingStaff, preferredShift: e.target.value as any })}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="any">Any Shift</option>
                  <option value="morning">Morning Shifts</option>
                  <option value="evening">Evening Shifts</option>
                  <option value="night">Night Shifts</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-2xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
