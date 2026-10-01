'use client';

import React, { useState, useEffect } from 'react';
import { useRoster } from '../../context/RosterContext';
import { Shift, DayOfWeek } from '../../types';
import { X, Calendar, Clock, DollarSign, Users, Trash2, Check } from 'lucide-react';

interface ShiftEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftToEdit?: Shift | null;
  defaultDay?: DayOfWeek;
}

export const ShiftEditModal: React.FC<ShiftEditModalProps> = ({
  isOpen,
  onClose,
  shiftToEdit,
  defaultDay = 'mon'
}) => {
  const { addShift, updateShift, deleteShift, staffList, roster } = useRoster();

  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [title, setTitle] = useState('Morning Shift (Opening)');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('15:30');
  const [requiredCount, setRequiredCount] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(16.50);
  const [assignedStaffIds, setAssignedStaffIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (shiftToEdit) {
      setDay(shiftToEdit.day);
      setTitle(shiftToEdit.title);
      setStartTime(shiftToEdit.startTime);
      setEndTime(shiftToEdit.endTime);
      setRequiredCount(shiftToEdit.requiredCount);
      setHourlyRate(shiftToEdit.hourlyRate);
      setAssignedStaffIds(shiftToEdit.assignedStaffIds);
      setNotes(shiftToEdit.notes || '');
    } else {
      setDay(defaultDay);
      setTitle('Morning Shift (Opening)');
      setStartTime('07:30');
      setEndTime('15:30');
      setRequiredCount(2);
      setHourlyRate(16.50);
      setAssignedStaffIds([]);
      setNotes('');
    }
  }, [shiftToEdit, defaultDay, isOpen]);

  if (!isOpen) return null;

  const toggleStaffAssignment = (staffId: string) => {
    if (assignedStaffIds.includes(staffId)) {
      setAssignedStaffIds(assignedStaffIds.filter(id => id !== staffId));
    } else {
      if (assignedStaffIds.length < requiredCount) {
        setAssignedStaffIds([...assignedStaffIds, staffId]);
      } else {
        setAssignedStaffIds([...assignedStaffIds, staffId]);
        setRequiredCount(assignedStaffIds.length + 1);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const dayOffsets: Record<DayOfWeek, number> = {
      mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6
    };
    const baseDate = new Date(roster.weekStart);
    baseDate.setDate(baseDate.getDate() + dayOffsets[day]);
    const dateStr = baseDate.toISOString().split('T')[0];

    if (shiftToEdit) {
      updateShift({
        ...shiftToEdit,
        day,
        date: dateStr,
        title,
        startTime,
        endTime,
        requiredCount,
        hourlyRate,
        assignedStaffIds,
        notes
      });
    } else {
      addShift({
        day,
        date: dateStr,
        title,
        startTime,
        endTime,
        requiredCount,
        hourlyRate,
        assignedStaffIds,
        notes
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (shiftToEdit) {
      deleteShift(shiftToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">
            {shiftToEdit ? 'Edit Shift Details' : 'Create New Shift'}
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Day of week */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
            <div className="grid grid-cols-7 gap-1">
              {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as DayOfWeek[]).map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDay(d)}
                  className={`rounded-lg py-1.5 text-xs font-bold uppercase transition-all ${
                    day === d
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Title & Role</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Morning Shift (Opening)"
              className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Times & Hourly Rate */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-600" /> Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-600" /> End
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-emerald-700" /> Wage / hr
              </label>
              <input
                type="number"
                step="0.50"
                min="10"
                value={hourlyRate}
                onChange={e => setHourlyRate(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Headcount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-600" /> Required Headcount
              </span>
              <span className="text-blue-700 font-bold text-xs">{requiredCount} Staff Needed</span>
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={requiredCount}
              onChange={e => setRequiredCount(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Assign Staff Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assign Staff ({assignedStaffIds.length}/{requiredCount})
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {staffList
                .filter(s => s.status === 'active')
                .map(staff => {
                  const isAssigned = assignedStaffIds.includes(staff.id);
                  const isAvailable = staff.availability[day];
                  return (
                    <button
                      type="button"
                      key={staff.id}
                      onClick={() => toggleStaffAssignment(staff.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors border ${
                        isAssigned
                          ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <img src={staff.avatar} alt={staff.name} className="h-6 w-6 rounded-full object-cover" />
                      <div className="flex-1 truncate">
                        <div className="truncate font-semibold text-slate-800">{staff.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {isAvailable ? '✓ Available' : '✕ Marked Off'}
                        </div>
                      </div>
                      {isAssigned && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Instructions & Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Weekly milk order delivery at 09:00"
              className="w-full rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {shiftToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Shift</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-semibold text-white shadow-2xs transition-all"
              >
                {shiftToEdit ? 'Save Changes' : 'Create Shift'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
