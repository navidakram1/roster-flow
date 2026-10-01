'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { ShiftTemplate, DayOfWeek } from '../../types';
import {
  X,
  SlidersHorizontal,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  BookmarkCheck,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShiftTemplateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftTemplateSettingsModal: React.FC<ShiftTemplateSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    templates,
    saveTemplate,
    deleteTemplate,
    applyTemplate,
    applyTemplateToDay,
    saveCurrentDayAsTemplate,
    selectedDay,
    roster,
    currentBusiness
  } = useRoster();

  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'save_day'>('browse');

  // Form state for creating/editing a template
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templateShifts, setTemplateShifts] = useState<{
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    title: string;
    requiredCount: number;
    hourlyRate: number;
  }[]>([
    { day: 'mon', startTime: '07:30', endTime: '15:30', title: 'Morning Shift (Opening)', requiredCount: 2, hourlyRate: 16.50 },
    { day: 'mon', startTime: '15:00', endTime: '22:30', title: 'Evening Shift (Closing)', requiredCount: 2, hourlyRate: 15.00 }
  ]);

  // Form state for Save Current Day as Template
  const [saveDayName, setSaveDayName] = useState(`Standard ${selectedDay.toUpperCase()} Schedule`);
  const [saveDayDesc, setSaveDayDesc] = useState(`Reusable shift layout captured from ${selectedDay.toUpperCase()}`);

  const currentDayShifts = roster.shifts.filter(s => s.day === selectedDay);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingTemplateId(null);
    setTemplateName('Standard Schedule');
    setTemplateDesc('Standard 2-shift daily coverage');
    setTemplateShifts([
      { day: selectedDay, startTime: '07:30', endTime: '15:30', title: 'Morning Shift (Opening)', requiredCount: 2, hourlyRate: 16.50 },
      { day: selectedDay, startTime: '15:00', endTime: '22:30', title: 'Evening Shift (Closing)', requiredCount: 2, hourlyRate: 15.00 }
    ]);
    setActiveTab('create');
  };

  const handleStartEdit = (tpl: ShiftTemplate) => {
    setEditingTemplateId(tpl.id);
    setTemplateName(tpl.name);
    setTemplateDesc(tpl.description || '');
    setTemplateShifts([...tpl.shifts]);
    setActiveTab('create');
  };

  const handleAddShiftRow = () => {
    setTemplateShifts(prev => [
      ...prev,
      {
        day: selectedDay,
        startTime: '15:00',
        endTime: '22:30',
        title: 'Evening Shift (Closing)',
        requiredCount: 2,
        hourlyRate: 15.00
      }
    ]);
  };

  const handleRemoveShiftRow = (index: number) => {
    setTemplateShifts(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateShiftRow = (index: number, field: string, value: any) => {
    setTemplateShifts(prev =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveTemplateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      alert('Please provide a template name.');
      return;
    }
    if (templateShifts.length === 0) {
      alert('Please add at least one shift to this template.');
      return;
    }

    const tpl: ShiftTemplate = {
      id: editingTemplateId || `tpl_${Date.now()}`,
      businessId: currentBusiness.id,
      name: templateName.trim(),
      description: templateDesc.trim(),
      shifts: templateShifts
    };

    saveTemplate(tpl);
    setActiveTab('browse');
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const handleSaveCurrentDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveDayName.trim()) {
      alert('Please provide a name for this template.');
      return;
    }

    saveCurrentDayAsTemplate(saveDayName.trim(), saveDayDesc.trim(), selectedDay);
    setActiveTab('browse');
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const handleApplyToDay = (tplId: string) => {
    if (confirm(`Apply this template to ${selectedDay.toUpperCase()}? This will update the shifts for this day.`)) {
      applyTemplateToDay(tplId, selectedDay);
      onClose();
    }
  };

  const handleApplyToWeek = (tplId: string) => {
    if (confirm('Apply this template to the entire weekly schedule?')) {
      applyTemplate(tplId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100/70 border border-blue-200 text-blue-700">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Shift Template Settings</h3>
              <p className="text-xs text-slate-500">
                Design and manage reusable shift blueprints for fast scheduling
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-white gap-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Saved Templates ({templates.length})</span>
          </button>

          <button
            onClick={handleStartCreate}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>{editingTemplateId ? 'Edit Template' : 'Create New Template'}</span>
          </button>

          <button
            onClick={() => {
              setSaveDayName(`Standard ${selectedDay.toUpperCase()} Schedule`);
              setActiveTab('save_day');
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'save_day'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookmarkCheck className="h-4 w-4" />
            <span>Save from Today ({selectedDay.toUpperCase()})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: BROWSE TEMPLATES */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Select a template to apply to your schedule, or edit shift configurations.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Template</span>
                </button>
              </div>

              {templates.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl p-6">
                  <SlidersHorizontal className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No shift templates created yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Create templates for standard weekdays, busy weekends, or opening rushes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map(tpl => {
                    const totalHours = tpl.shifts.reduce((acc, s) => {
                      const [sh] = s.startTime.split(':').map(Number);
                      const [eh] = s.endTime.split(':').map(Number);
                      const dur = eh < sh ? eh + 24 - sh : eh - sh;
                      return acc + dur * s.requiredCount;
                    }, 0);

                    return (
                      <div
                        key={tpl.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{tpl.name}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                {tpl.shifts.length} Shifts defined
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{tpl.description}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApplyToDay(tpl.id)}
                              className="inline-flex items-center gap-1 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-800 transition-colors"
                              title={`Apply shifts to ${selectedDay.toUpperCase()}`}
                            >
                              <span>Apply to Today ({selectedDay.toUpperCase()})</span>
                            </button>

                            <button
                              onClick={() => handleApplyToWeek(tpl.id)}
                              className="inline-flex items-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                              title="Apply to entire 7-day roster"
                            >
                              <span>Apply to Week</span>
                            </button>
                          </div>
                        </div>

                        {/* Shift List Preview */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {tpl.shifts.map((sh, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs"
                            >
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                                <span className="text-blue-700 font-bold uppercase">{sh.day}</span>
                                <span>{sh.startTime} – {sh.endTime}</span>
                              </div>
                              <div className="font-bold text-slate-800 truncate">{sh.title}</div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                                <span>{sh.requiredCount} staff needed</span>
                                <span className="font-mono text-emerald-700 font-bold">€{sh.hourlyRate}/h</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer Controls */}
                        <div className="mt-3 pt-2.5 flex items-center justify-between text-xs text-slate-400">
                          <span>Total scheduled labor: ~{totalHours} hours</span>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleStartEdit(tpl)}
                              className="font-semibold text-blue-600 hover:text-blue-800"
                            >
                              Edit Blueprint
                            </button>
                            <span>•</span>
                            <button
                              onClick={() => {
                                if (confirm(`Delete template "${tpl.name}"?`)) {
                                  deleteTemplate(tpl.id);
                                }
                              }}
                              className="font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE / EDIT TEMPLATE FORM */}
          {activeTab === 'create' && (
            <form onSubmit={handleSaveTemplateForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    placeholder="e.g. Busy Weekend Layout, 3-Barista Morning"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
                  <input
                    type="text"
                    value={templateDesc}
                    onChange={e => setTemplateDesc(e.target.value)}
                    placeholder="e.g. Higher coverage for peak brunch hours"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Shift definitions builder */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Shift Definitions ({templateShifts.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddShiftRow}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Shift</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {templateShifts.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/70"
                    >
                      {/* Day selection */}
                      <select
                        value={s.day}
                        onChange={e => handleUpdateShiftRow(idx, 'day', e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold uppercase"
                      >
                        <option value="mon">Mon</option>
                        <option value="tue">Tue</option>
                        <option value="wed">Wed</option>
                        <option value="thu">Thu</option>
                        <option value="fri">Fri</option>
                        <option value="sat">Sat</option>
                        <option value="sun">Sun</option>
                      </select>

                      {/* Shift Title */}
                      <input
                        type="text"
                        required
                        value={s.title}
                        onChange={e => handleUpdateShiftRow(idx, 'title', e.target.value)}
                        placeholder="Shift Title"
                        className="flex-1 min-w-[140px] rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
                      />

                      {/* Times */}
                      <div className="flex items-center gap-1">
                        <input
                          type="time"
                          value={s.startTime}
                          onChange={e => handleUpdateShiftRow(idx, 'startTime', e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono"
                        />
                        <span className="text-slate-400 text-xs">–</span>
                        <input
                          type="time"
                          value={s.endTime}
                          onChange={e => handleUpdateShiftRow(idx, 'endTime', e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono"
                        />
                      </div>

                      {/* Staff Count */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-semibold">Staff:</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={s.requiredCount}
                          onChange={e => handleUpdateShiftRow(idx, 'requiredCount', parseInt(e.target.value || '1', 10))}
                          className="w-12 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-center font-bold"
                        />
                      </div>

                      {/* Wage Rate */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-semibold">€/h:</span>
                        <input
                          type="number"
                          step="0.5"
                          min="10"
                          value={s.hourlyRate}
                          onChange={e => handleUpdateShiftRow(idx, 'hourlyRate', parseFloat(e.target.value || '15'))}
                          className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-center font-mono font-bold"
                        />
                      </div>

                      {/* Delete row */}
                      <button
                        type="button"
                        onClick={() => handleRemoveShiftRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                        title="Remove shift"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-all"
                >
                  Save Shift Template
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SAVE FROM CURRENT DAY */}
          {activeTab === 'save_day' && (
            <form onSubmit={handleSaveCurrentDay} className="space-y-4">
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                  Active Shifts for {selectedDay.toUpperCase()} ({currentDayShifts.length})
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  This will snapshot all shifts currently scheduled on {selectedDay.toUpperCase()} into a reusable template.
                </p>

                {currentDayShifts.length === 0 ? (
                  <p className="text-xs text-amber-700 font-semibold">
                    ⚠️ No shifts are currently scheduled on {selectedDay.toUpperCase()}. Add shifts first before saving.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {currentDayShifts.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-white rounded-lg p-2 border border-blue-100"
                      >
                        <span className="font-bold text-slate-800">{s.title}</span>
                        <span className="text-slate-500 font-mono">
                          {s.startTime} – {s.endTime} • {s.requiredCount} staff • €{s.hourlyRate}/h
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Template Name</label>
                <input
                  type="text"
                  required
                  value={saveDayName}
                  onChange={e => setSaveDayName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={saveDayDesc}
                  onChange={e => setSaveDayDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={currentDayShifts.length === 0}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition-all"
                >
                  Snapshot & Save Template
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
