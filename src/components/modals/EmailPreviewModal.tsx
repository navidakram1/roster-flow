'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { X, Mail, Send, CheckCircle2, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

export const EmailPreviewModal: React.FC = () => {
  const { selectedEmailPreview, setSelectedEmailPreview, currentBusiness } = useRoster();
  const [sent, setSent] = useState(false);

  if (!selectedEmailPreview || !selectedEmailPreview.emailDetails) return null;

  const { to, subject, preview } = selectedEmailPreview.emailDetails;

  const handleSendTest = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSelectedEmailPreview(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setSelectedEmailPreview(null)}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-3">
          <Mail className="h-4 w-4" />
          <span>Automated Email Notification Preview</span>
        </div>

        {/* Email Envelope Container */}
        <div className="rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm overflow-hidden text-xs">
          {/* Header Metadata */}
          <div className="bg-slate-50 p-3.5 border-b border-slate-200 space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-500">
              <span>From: <strong className="text-slate-800 font-sans">RosterFlow Dispatcher &lt;notifications@rosterflow.app&gt;</strong></span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                <ShieldCheck className="h-3 w-3" /> SPF/DKIM Verified
              </span>
            </div>
            <div className="text-slate-500">
              To: <strong className="text-slate-800 font-sans">{to}</strong>
            </div>
            <div className="text-slate-900 font-bold font-sans text-xs pt-1">
              Subject: {subject}
            </div>
          </div>

          {/* Email Body */}
          <div className="p-5 space-y-4">
            {/* Business Logo Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  RF
                </div>
                <span className="font-bold text-slate-900 text-sm">{currentBusiness.name}</span>
              </div>
              <span className="text-[10px] text-slate-400">Powered by RosterFlow</span>
            </div>

            <div className="space-y-2 text-slate-700 leading-relaxed text-xs">
              <p className="font-semibold text-slate-900">Hello,</p>
              <p>{preview}</p>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-blue-900 my-2">
                <div className="font-semibold text-xs mb-1">Notification Details:</div>
                <p className="text-[11px] text-slate-600 leading-normal">{selectedEmailPreview.message}</p>
              </div>
              <p className="text-slate-500 text-[11px]">
                Please review your schedule or tasks in your workplace dashboard at your earliest convenience.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedEmailPreview(null)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors"
              >
                <span>Open in RosterFlow</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            {/* Email Footer */}
            <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>{currentBusiness.address}</span>
              <span>Preferences • Unsubscribe</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Triggered automatically by workplace events
          </span>
          <button
            onClick={handleSendTest}
            disabled={sent}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition-all shadow-2xs"
          >
            {sent ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
            <span>{sent ? 'Dispatched Simulation!' : 'Resend Email Simulation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
