'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { downloadIcsFile, generateGoogleCalendarUrl } from '../../lib/calendarExport';
import { exportWeeklyRosterPdf } from '../../lib/exportPdf';
import {
  Calendar,
  ExternalLink,
  X,
  User,
  Users,
  FileCheck,
  FileText,
  Table,
  CheckSquare,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DownloadDoneIcon, CopiedIcon } from '../ui/animated-state-icons';

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'pdf' | 'calendar';
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'pdf'
}) => {
  const { roster, currentBusiness, staffList, activeStaffId, activeRole } = useRoster();

  const [activeTab, setActiveTab] = useState<'pdf' | 'calendar'>(defaultTab);

  // PDF Export state
  const [pdfLayout, setPdfLayout] = useState<'both' | 'matrix' | 'detailed'>('both');
  const [includeCosts, setIncludeCosts] = useState(true);
  const [includeNotesInPdf, setIncludeNotesInPdf] = useState(true);
  const [pdfStaffFilter, setPdfStaffFilter] = useState<'all' | 'mine' | string>('all');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // iCal Export state
  const [exportFilter, setExportFilter] = useState<'all' | 'mine' | string>('all');
  const [includeNotes, setIncludeNotes] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Filter shifts based on selection for iCal
  const selectedStaffId = exportFilter === 'all' 
    ? undefined 
    : exportFilter === 'mine' 
      ? activeStaffId 
      : exportFilter;

  const filteredShifts = selectedStaffId
    ? roster.shifts.filter(s => s.assignedStaffIds.includes(selectedStaffId))
    : roster.shifts;

  const targetStaff = staffList.find(s => s.id === selectedStaffId);

  // Filter shifts for PDF preview
  const pdfTargetStaffId = pdfStaffFilter === 'all'
    ? undefined
    : pdfStaffFilter === 'mine'
      ? activeStaffId
      : pdfStaffFilter;

  const pdfFilteredShifts = pdfTargetStaffId
    ? roster.shifts.filter(s => s.assignedStaffIds.includes(pdfTargetStaffId))
    : roster.shifts;

  // Generate webcal feed url mock
  const webcalUrl = `webcal://${typeof window !== 'undefined' ? window.location.host : 'rosterflow.app'}/api/calendar/${currentBusiness.slug || 'business'}/${roster.id}.ics?staffId=${selectedStaffId || 'all'}`;

  const handleDownloadIcs = () => {
    try {
      const filename = selectedStaffId
        ? `${currentBusiness.slug || 'roster'}-${targetStaff?.name.toLowerCase().replace(/\s+/g, '-') || 'staff'}-${roster.weekStart}.ics`
        : `${currentBusiness.slug || 'roster'}-all-shifts-${roster.weekStart}.ics`;

      downloadIcsFile({
        roster,
        business: currentBusiness,
        staffList,
        filterStaffId: selectedStaffId,
        includeNotes
      }, filename);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Export download error:', err);
    }
  };

  const handleDownloadPdf = () => {
    setIsPdfGenerating(true);
    try {
      exportWeeklyRosterPdf({
        roster,
        business: currentBusiness,
        staffList,
        includeCosts,
        filterStaffId: pdfTargetStaffId || 'all',
        layout: pdfLayout
      });

      confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(webcalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const firstShift = filteredShifts[0];
  const gcalUrl = firstShift 
    ? generateGoogleCalendarUrl(firstShift, currentBusiness, staffList) 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 pt-5 pb-3 bg-gradient-to-r from-blue-50/60 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                {activeTab === 'pdf' ? <FileText className="h-5 w-5 text-red-600" /> : <Calendar className="h-5 w-5 text-blue-600" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Export Roster Schedule</h2>
                <p className="text-xs text-slate-500">Download Weekly Table PDF or sync with calendar apps</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'pdf'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-red-600" />
              <span>Weekly Table (PDF)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">New</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span>Calendar Sync (.ics)</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* TAB 1: WEEKLY TABLE PDF */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              {/* Target Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Staff Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfStaffFilter('all')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      pdfStaffFilter === 'all'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 ring-2 ring-blue-600/20 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Entire Team ({roster.shifts.length} shifts)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfStaffFilter('mine')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      pdfStaffFilter === 'mine'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 ring-2 ring-blue-600/20 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>My Shifts Only</span>
                  </button>
                </div>

                {/* Individual Staff Dropdown */}
                {activeRole === 'owner' && (
                  <div className="pt-1">
                    <select
                      value={pdfStaffFilter}
                      onChange={(e) => setPdfStaffFilter(e.target.value)}
                      className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    >
                      <option value="all">Include All Staff Members</option>
                      <option value="mine">Filter to Active User</option>
                      <optgroup label="Export Specific Team Member:">
                        {staffList.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.jobTitle})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>

              {/* Table Layout Choice */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  PDF Table Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfLayout('both')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      pdfLayout === 'both'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 ring-2 ring-blue-600/20 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Table className="h-4 w-4 mb-1 text-blue-600" />
                    <span className="text-[11px] font-bold">Both Tables</span>
                    <span className="text-[9px] text-slate-500">Matrix + Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfLayout('matrix')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      pdfLayout === 'matrix'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 ring-2 ring-blue-600/20 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Table className="h-4 w-4 mb-1 text-blue-600" />
                    <span className="text-[11px] font-bold">Wall Grid</span>
                    <span className="text-[9px] text-slate-500">Staff x 7 Days</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfLayout('detailed')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      pdfLayout === 'detailed'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 ring-2 ring-blue-600/20 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckSquare className="h-4 w-4 mb-1 text-blue-600" />
                    <span className="text-[11px] font-bold">Day by Day</span>
                    <span className="text-[9px] text-slate-500">Shift Breakdown</span>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
                <div className="text-xs font-bold text-slate-700">Display Options</div>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCosts}
                    onChange={(e) => setIncludeCosts(e.target.checked)}
                    className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Include estimated hourly rates & payroll costs</span>
                </label>
                <div className="text-[11px] text-slate-500 pt-0.5 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Formatted in landscape A4 ready for office wall posting or printing.</span>
                </div>
              </div>

              {/* Summary Preview Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div>
                  <div className="text-xs font-bold text-blue-900">
                    {pdfFilteredShifts.length} {pdfFilteredShifts.length === 1 ? 'Shift' : 'Shifts'} ready for Weekly PDF
                  </div>
                  <div className="text-[11px] text-blue-700">
                    Period: Week of Oct 5 – Oct 11, 2026 • {currentBusiness.name}
                  </div>
                </div>
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>

              {/* Primary PDF Download Action */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isPdfGenerating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <FileText className="h-4 w-4 text-white" />
                  <span>{isPdfGenerating ? 'Generating Weekly PDF...' : 'Download Weekly Table PDF'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CALENDAR SYNC (.ICS) */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              {/* Target Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Shifts to Export
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFilter('all')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      exportFilter === 'all'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 ring-2 ring-blue-600/20 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Entire Team ({roster.shifts.length} shifts)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFilter('mine')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      exportFilter === 'mine'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 ring-2 ring-blue-600/20 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>My Shifts Only</span>
                  </button>
                </div>

                {/* Individual Staff Dropdown */}
                {activeRole === 'owner' && (
                  <div className="pt-1">
                    <select
                      value={exportFilter}
                      onChange={(e) => setExportFilter(e.target.value)}
                      className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    >
                      <option value="all">Export All Staff Shifts</option>
                      <option value="mine">Export Active User Shifts</option>
                      <optgroup label="Export Specific Team Member:">
                        {staffList.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.jobTitle})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>

              {/* Export Options */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-700">Calendar Options</div>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNotes}
                    onChange={(e) => setIncludeNotes(e.target.checked)}
                    className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Include shift notes & workplace hourly rates in event descriptions</span>
                </label>
                <div className="text-[11px] text-slate-500 pt-1">
                  • Timezone: <span className="font-semibold text-slate-700">{currentBusiness.timezone}</span>
                  <br />
                  • Location: <span className="font-semibold text-slate-700">{currentBusiness.address}</span>
                </div>
              </div>

              {/* Summary Preview Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div>
                  <div className="text-xs font-bold text-blue-900">
                    {filteredShifts.length} {filteredShifts.length === 1 ? 'Shift' : 'Shifts'} Ready to Export
                  </div>
                  <div className="text-[11px] text-blue-700">
                    Schedule period: Week of Oct 5 – Oct 11, 2026
                  </div>
                </div>
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>

              {/* Export Actions */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Direct iCalendar .ics File Download */}
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-sm transition-all group"
                >
                  <DownloadDoneIcon size={18} color="white" />
                  <span>Download iCalendar (.ics) File</span>
                </button>

                {/* 2. Direct Google Calendar Event link */}
                {gcalUrl && (
                  <a
                    href={gcalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <span>Add First Shift to Google Calendar</span>
                  </a>
                )}

                {/* 3. Subscription Feed URL */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Calendar Subscription Link (Webcal)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={webcalUrl}
                      className="flex-1 text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                    >
                      <CopiedIcon size={16} active={copiedLink} color={copiedLink ? '#059669' : '#475569'} />
                      <span className={copiedLink ? 'text-emerald-700 font-bold' : ''}>
                        {copiedLink ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Paste into Apple Calendar (File &gt; New Calendar Subscription) or Google Calendar (Other calendars &gt; From URL).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex justify-between items-center">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>High-res vector PDF & RFC 5545</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
