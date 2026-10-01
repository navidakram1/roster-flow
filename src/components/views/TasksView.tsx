'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { Task } from '../../types';
import {
  CheckSquare,
  Sparkles,
  Plus,
  Clock,
  User,
  CheckCircle2,
  Trash2,
  Mail,
  AlertCircle,
  Repeat
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const {
    tasks,
    createTask,
    toggleTaskStatus,
    deleteTask,
    generateAITasks,
    staffList,
    activeRole
  } = useRoster();

  const [activeShiftFilter, setActiveShiftFilter] = useState<'all' | 'opening' | 'mid' | 'closing'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [shiftType, setShiftType] = useState<'opening' | 'mid' | 'closing' | 'general'>('opening');
  const [dueTime, setDueTime] = useState('08:00');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');

  const filteredTasks = tasks.filter(t => {
    if (activeShiftFilter === 'all') return true;
    return t.shiftType === activeShiftFilter;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      title,
      description,
      assignedStaffId: assignedStaffId || undefined,
      shiftType,
      dueDate: new Date().toISOString().split('T')[0],
      dueTime,
      priority,
      recurring: 'daily'
    });

    setTitle('');
    setDescription('');
    setAssignedStaffId('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Task Operations Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Daily Operational Task Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign shift duties, opening checklists, and sanitation routines with automatic email dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Task Generator Quick Actions */}
          {activeRole === 'owner' && (
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 p-1">
              <span className="text-[11px] font-semibold text-blue-800 px-2 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                AI Generate:
              </span>
              <button
                onClick={() => generateAITasks('opening')}
                className="rounded-lg bg-blue-100 hover:bg-blue-200/80 px-2.5 py-1 text-[11px] font-medium text-blue-800 transition-colors"
              >
                Opening
              </button>
              <button
                onClick={() => generateAITasks('closing')}
                className="rounded-lg bg-blue-100 hover:bg-blue-200/80 px-2.5 py-1 text-[11px] font-medium text-blue-800 transition-colors"
              >
                Closing
              </button>
            </div>
          )}

          {activeRole === 'owner' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'opening', 'mid', 'closing'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setActiveShiftFilter(tabKey)}
            className={`rounded-xl px-4 py-1.5 text-xs font-semibold capitalize transition-all border ${
              activeShiftFilter === tabKey
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {tabKey === 'all' ? 'All Duties' : `${tabKey} Shift`}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredTasks.map(task => {
          const assigned = staffList.find(s => s.id === task.assignedStaffId);
          const isDone = task.status === 'completed';

          return (
            <div
              key={task.id}
              className={`rounded-2xl border p-4 transition-all ${
                isDone
                  ? 'border-slate-200 bg-slate-50/70 opacity-70'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-0.5 h-5 w-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      isDone
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 hover:border-blue-500 bg-white'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="h-4 w-4" />}
                  </button>

                  <div className="space-y-1">
                    <h4 className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Priority Badge */}
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

              {/* Footer info: Assignee, Due Time, Email Status */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  {assigned ? (
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <img
                        src={assigned.avatar}
                        alt={assigned.name}
                        className="h-4 w-4 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-800">{assigned.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">Unassigned</span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-blue-700 font-medium">
                    <Clock className="h-3 w-3" /> {task.dueTime}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                    <Mail className="h-3 w-3" /> Email reminder on
                  </span>
                  {activeRole === 'owner' && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Create Daily Operational Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanitize prep tables & check freezer temperature"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Instructions / Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed notes for the staff member on duty..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Shift Period</label>
                  <select
                    value={shiftType}
                    onChange={e => setShiftType(e.target.value as any)}
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="opening">Opening Shift</option>
                    <option value="mid">Mid-Day Shift</option>
                    <option value="closing">Closing Shift</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Time</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={e => setDueTime(e.target.value)}
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assign Staff</label>
                  <select
                    value={assignedStaffId}
                    onChange={e => setAssignedStaffId(e.target.value)}
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Unassigned (Any On Duty)</option>
                    {staffList.filter(s => s.status === 'active').map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-2xs"
                >
                  Create & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
