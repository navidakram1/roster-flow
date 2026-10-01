'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { Shift } from '../../types';
import { X, ArrowRightLeft, Sparkles, Check, Send } from 'lucide-react';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftToSwap: Shift | null;
}

export const SwapRequestModal: React.FC<SwapRequestModalProps> = ({
  isOpen,
  onClose,
  shiftToSwap
}) => {
  const { activeStaffId, staffList, createSwapRequest, currentStaffProfile } = useRoster();

  const [selectedColleague, setSelectedColleague] = useState<string>('');
  const [reason, setReason] = useState('Personal scheduling conflict');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !shiftToSwap) return null;

  const eligibleColleagues = staffList.filter(staff => {
    if (staff.id === activeStaffId) return false;
    if (staff.status !== 'active') return false;
    if (shiftToSwap.assignedStaffIds.includes(staff.id)) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSwapRequest(shiftToSwap.id, activeStaffId, selectedColleague || undefined, reason);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Request Shift Swap</h3>
            <p className="text-xs text-slate-500">Transfer your shift to an eligible team member</p>
          </div>
        </div>

        {/* Selected Shift Details */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 mb-4">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Your Shift to Trade</div>
          <div className="text-sm font-bold text-slate-900 mt-1">{shiftToSwap.title}</div>
          <div className="text-xs text-blue-700 font-semibold mt-0.5">
            {shiftToSwap.day.toUpperCase()} ({shiftToSwap.date}) • {shiftToSwap.startTime} – {shiftToSwap.endTime}
          </div>
        </div>

        {submitted ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
            <Check className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-xs font-semibold text-emerald-800">Swap Request Dispatched!</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Colleague notified. Once accepted, manager will review and approve.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Suggested Replacement Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Select Colleague</span>
                <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Smart Matched
                </span>
              </label>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {eligibleColleagues.map(colleague => {
                  const isDayAvailable = colleague.availability[shiftToSwap.day];
                  return (
                    <label
                      key={colleague.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        selectedColleague === colleague.id
                          ? 'bg-blue-50 border-blue-400 text-slate-900 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="colleague"
                          value={colleague.id}
                          checked={selectedColleague === colleague.id}
                          onChange={() => setSelectedColleague(colleague.id)}
                          className="h-3.5 w-3.5 text-blue-600 border-slate-300"
                        />
                        <img src={colleague.avatar} alt={colleague.name} className="h-7 w-7 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{colleague.name}</div>
                          <div className="text-[10px] text-slate-500">{colleague.jobTitle}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isDayAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isDayAvailable ? 'Available' : 'Needs Check'}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Swap</label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Doctor appointment, family event..."
                className="w-full rounded-lg bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Workflow Explainer */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5 text-[11px] text-slate-600 leading-relaxed">
              <strong>Two-tier Workflow:</strong> Your colleague receives an in-app & email notification. When they accept, the owner receives a 1-click approval prompt to officially commit the swap to the roster.
            </div>

            <button
              type="submit"
              disabled={!selectedColleague}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Swap Request</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
