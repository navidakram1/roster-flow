'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { X, Copy, Check, QrCode, Sparkles, UserPlus, Link2, ShieldCheck } from 'lucide-react';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteStaffModal: React.FC<InviteStaffModalProps> = ({ isOpen, onClose }) => {
  const { currentBusiness, inviteLink, simulateStaffJoinLink } = useRoster();
  const [copied, setCopied] = useState(false);
  const [simName, setSimName] = useState('');
  const [simRole, setSimRole] = useState('Team Member');
  const [simSuccess, setSimSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) return;
    simulateStaffJoinLink(simName, simRole, `${simName.toLowerCase().replace(/\s+/g, '.')}@example.com`);
    setSimSuccess(true);
    setSimName('');
    setTimeout(() => {
      setSimSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <Link2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Staff Join Room & Deep Link</h3>
            <p className="text-xs text-slate-500">
              Invite team members directly to <span className="text-blue-700 font-semibold">{currentBusiness.name}</span>
            </p>
          </div>
        </div>

        {/* Deep Link URL Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              Direct Onboarding Link (Deeplink)
            </span>
            <span className="font-mono text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
              Code: {currentBusiness.inviteCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800 select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white transition-all shadow-2xs"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
            Staff open this link on mobile or desktop, authenticate with Google, set their weekly availability, and submit their profile.
          </p>
        </div>

        {/* QR Code Graphic Representation */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 mb-5 shadow-2xs">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
            {/* SVG stylized QR code */}
            <svg viewBox="0 0 100 100" className="h-full w-full text-slate-900 fill-current">
              <path d="M10 10h30v30h-30zM20 20h10v10h-10zM60 10h30v30h-30zM70 20h10v10h-10zM10 60h30v30h-30zM20 70h10v10h-10zM50 10h5v15h-5zM50 35h15v5h-15zM75 50h15v5h-15zM60 60h10v10h-10zM80 60h10v10h-10zM70 80h10v10h-10zM50 65h5v25h-5z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <QrCode className="h-4 w-4 text-blue-600" />
              Workplace Wall QR Code
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Print this QR code on your staff break-room board so new hourly workers can scan and join in 5 seconds.
            </p>
          </div>
        </div>

        {/* Live Simulation Sandbox for Testing */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-900">Test Join Flow (Interactive Simulation)</span>
          </div>
          <p className="text-[11px] text-slate-600 mb-3">
            Simulate an applicant clicking your deep link right now. They will appear in your approval queue.
          </p>

          {simSuccess ? (
            <div className="rounded-lg bg-emerald-100 border border-emerald-300 p-2.5 text-center text-xs font-semibold text-emerald-800">
              ✓ Join request received! Check the Staff tab to approve.
            </div>
          ) : (
            <form onSubmit={handleSimulateJoin} className="flex gap-2">
              <input
                type="text"
                placeholder="Applicant name (e.g. Alex Rivera)"
                value={simName}
                onChange={e => setSimName(e.target.value)}
                className="flex-1 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <select
                value={simRole}
                onChange={e => setSimRole(e.target.value)}
                className="rounded-lg bg-white border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="Team Member">Team Member</option>
                <option value="Operations Associate">Operations Associate</option>
                <option value="Shift Supervisor">Shift Supervisor</option>
                <option value="Specialist">Specialist</option>
                <option value="General Staff">General Staff</option>
              </select>
              <button
                type="submit"
                disabled={!simName.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-2xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Simulate</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
