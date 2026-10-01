'use client';

import React from 'react';
import { useRoster } from '../../context/RosterContext';
import { ArrowRightLeft, Check, X, Clock, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

export const SwapsView: React.FC = () => {
  const {
    swapRequests,
    approveSwapRequest,
    rejectSwapRequest,
    staffList,
    activeRole,
    currentBusiness
  } = useRoster();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <ArrowRightLeft className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Shift Swaps & Coverage Approvals</h2>
        </div>
        <p className="text-xs text-slate-500">
          Staff trade shifts with peers. All changes require manager sign-off before automatically updating the official roster.
        </p>
      </div>

      {/* Two-tier approval workflow explanation banner */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-slate-700 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <span>
            <strong>Two-Tier Security:</strong> Staff member requests swap → Colleague accepts → <strong>Owner approves</strong> → Roster calendar updates automatically.
          </span>
        </div>
      </div>

      {/* Swaps List */}
      <div className="space-y-3.5">
        {swapRequests.map(swap => {
          const requester = staffList.find(s => s.id === swap.requesterStaffId);
          const target = staffList.find(s => s.id === swap.targetStaffId);
          const isPending = swap.status === 'pending_owner' || swap.status === 'pending_staff';

          return (
            <div
              key={swap.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-blue-300 hover:shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Swap Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{swap.shiftTitle}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        swap.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : swap.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {swap.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-blue-700 font-semibold">
                    {swap.shiftDate} • {swap.shiftTime}
                  </div>

                  {/* Staff Trade Visualization */}
                  <div className="flex items-center gap-3 pt-1">
                    {/* Requester */}
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs">
                      <img src={requester?.avatar} alt={requester?.name} className="h-5 w-5 rounded-full object-cover" />
                      <span className="text-slate-800 font-semibold">{requester?.name}</span>
                      <span className="text-[10px] text-slate-500">(Original)</span>
                    </div>

                    <ArrowRightLeft className="h-4 w-4 text-blue-600 shrink-0" />

                    {/* Replacement Target */}
                    <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs">
                      <img src={target?.avatar} alt={target?.name} className="h-5 w-5 rounded-full object-cover" />
                      <span className="text-blue-900 font-semibold">{target?.name || 'Open Pool'}</span>
                      <span className="text-[10px] text-blue-600 font-semibold">(Accepted)</span>
                    </div>
                  </div>

                  {/* Reason quote */}
                  <div className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-w-xl">
                    &ldquo;{swap.reason}&rdquo;
                  </div>
                </div>

                {/* Owner Actions */}
                {activeRole === 'owner' && isPending && (
                  <div className="flex sm:flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveSwapRequest(swap.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-all w-full justify-center"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve & Update Roster</span>
                    </button>

                    <button
                      onClick={() => rejectSwapRequest(swap.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-300 px-4 py-2 text-xs font-medium transition-colors w-full justify-center shadow-2xs"
                    >
                      <X className="h-4 w-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {swapRequests.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-xs">
            No shift swap requests at this time.
          </div>
        )}
      </div>
    </div>
  );
};
