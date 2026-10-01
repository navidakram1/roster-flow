'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { AIScheduleResult } from '../../lib/aiScheduler';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sliders,
  DollarSign,
  Clock,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ isOpen, onClose }) => {
  const { aiGenerateRoster, staffList } = useRoster();

  const [prompt, setPrompt] = useState('Ensure 3 staff for morning rush, keep everyone under their weekly hour caps, and give Sarah Wednesday off.');
  const [enforceMaxHours, setEnforceMaxHours] = useState(true);
  const [respectPreferences, setRespectPreferences] = useState(true);
  const [prioritizeSkills, setPrioritizeSkills] = useState(true);
  const [fillUnderstaffedOnly, setFillUnderstaffedOnly] = useState(false);

  const [previewResult, setPreviewResult] = useState<AIScheduleResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleRunAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const result = aiGenerateRoster({
        naturalLanguagePrompt: prompt,
        enforceMaxHours,
        respectShiftPreferences: respectPreferences,
        prioritizeSkills,
        fillUnderstaffedOnly
      });
      setPreviewResult(result);
      setIsGenerating(false);
    }, 600);
  };

  const handleApply = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1200);
  };

  const samplePrompts = [
    'Give Sarah Wednesday and Sunday off, prioritize Mike for morning shifts.',
    'Keep all hourly staff strictly under 28 hours this week to minimize labor cost.',
    'Ensure at least one supervisor or manager is scheduled on every opening shift.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">AI Roster Generation Studio</h3>
              <span className="rounded-full bg-blue-100 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                Rule & Constraint Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Transform staff availability, weekly hour limits, and natural business rules into an optimal schedule.
            </p>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-5">
          <div className="flex items-center justify-between text-xs text-slate-700 mb-2 font-semibold">
            <span className="flex items-center gap-1.5 text-blue-700">
              <Bot className="h-4 w-4 text-blue-600" />
              Natural Language Roster Directives
            </span>
            <span className="text-[11px] text-slate-500">Understands names, days off, and hour limits</span>
          </div>

          <textarea
            rows={2}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="E.g. Create next week's schedule. Give Sarah Friday off, Mike wants morning baking, keep everyone under 30 hours."
            className="w-full rounded-lg bg-white border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />

          {/* Quick preset chips */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Quick prompts:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(p)}
                className="rounded-full bg-white hover:bg-blue-50 border border-slate-200 px-2.5 py-1 text-[10px] text-slate-700 hover:text-blue-700 transition-colors truncate max-w-xs shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Constraint Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer shadow-2xs">
            <div>
              <div className="text-xs font-semibold text-slate-800">Strict Max Hours Cap</div>
              <div className="text-[11px] text-slate-500">Prevent scheduling staff above their weekly limits</div>
            </div>
            <input
              type="checkbox"
              checked={enforceMaxHours}
              onChange={e => setEnforceMaxHours(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer shadow-2xs">
            <div>
              <div className="text-xs font-semibold text-slate-800">Shift Timing Preferences</div>
              <div className="text-[11px] text-slate-500">Respect staff Morning vs Evening preferences</div>
            </div>
            <input
              type="checkbox"
              checked={respectPreferences}
              onChange={e => setRespectPreferences(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer shadow-2xs">
            <div>
              <div className="text-xs font-semibold text-slate-800">Skillset Matching</div>
              <div className="text-[11px] text-slate-500">Match Barista, Kitchen Lead, Supervisor tags</div>
            </div>
            <input
              type="checkbox"
              checked={prioritizeSkills}
              onChange={e => setPrioritizeSkills(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer shadow-2xs">
            <div>
              <div className="text-xs font-semibold text-slate-800">Fill Understaffed Only</div>
              <div className="text-[11px] text-slate-500">Keep existing manual assignments untouched</div>
            </div>
            <input
              type="checkbox"
              checked={fillUnderstaffedOnly}
              onChange={e => setFillUnderstaffedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>

        {/* Generate Trigger */}
        {!previewResult && (
          <button
            onClick={handleRunAI}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white shadow-sm transition-all"
          >
            <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{isGenerating ? 'AI Solving Staffing Constraints...' : 'Generate & Optimize Roster'}</span>
          </button>
        )}

        {/* AI Proposal Results & Explanation Inspector */}
        {previewResult && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Coverage Score</div>
                <div className="text-lg font-bold text-blue-700">{previewResult.stats.coverageScore}%</div>
                <div className="text-[10px] text-slate-500">{previewResult.stats.understaffedCount} understaffed</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Total Shifts</div>
                <div className="text-lg font-bold text-slate-900">{previewResult.stats.totalShifts}</div>
                <div className="text-[10px] text-slate-500">Across 7 days</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Total Hours</div>
                <div className="text-lg font-bold text-indigo-700">{previewResult.stats.totalHours}h</div>
                <div className="text-[10px] text-slate-500">Scheduled team</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Estimated Labor</div>
                <div className="text-lg font-bold text-emerald-700">€{previewResult.stats.estimatedCost.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500">Wages budget</div>
              </div>
            </div>

            {/* AI Summary Banner */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-3">
              <Bot className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-blue-900">AI Scheduling Rationale</div>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{previewResult.summary}</p>
              </div>
            </div>

            {/* Warnings if any */}
            {previewResult.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Coverage Warnings</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800/90">
                  {previewResult.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sample Transparent Decision Explanations */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 max-h-40 overflow-y-auto">
              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-600" />
                <span>Transparent Decision Explanations (Sample Shifts)</span>
              </div>
              <div className="space-y-2">
                {previewResult.shifts.slice(0, 3).map(shift => (
                  <div key={shift.id} className="rounded-lg bg-slate-50 p-2 border border-slate-200 text-[11px]">
                    <div className="flex items-center justify-between text-slate-800 font-semibold">
                      <span>{shift.title} ({shift.day.toUpperCase()} {shift.startTime}-{shift.endTime})</span>
                      <span className="text-blue-700 font-mono">{shift.assignedStaffIds.length}/{shift.requiredCount} Filled</span>
                    </div>
                    {shift.aiExplanation && Object.keys(shift.aiExplanation).length > 0 && (
                      <div className="mt-1 space-y-1">
                        {Object.entries(shift.aiExplanation).map(([staffId, reason]) => {
                          const member = staffList.find(s => s.id === staffId);
                          return (
                            <div key={staffId} className="text-slate-600 flex items-start gap-1">
                              <span className="text-blue-800 font-semibold">{member?.name || 'Staff'}:</span>
                              <span>{reason}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleRunAI}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
              >
                Regenerate with New Prompt
              </button>

              <button
                onClick={handleApply}
                disabled={applied}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all"
              >
                {applied ? <Check className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>{applied ? 'Roster Applied!' : 'Accept & Apply to Roster'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
