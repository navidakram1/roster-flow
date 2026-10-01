'use client';

import React, { useState } from 'react';
import { RosterProvider, useRoster } from '../context/RosterContext';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { DashboardView } from '../components/views/DashboardView';
import { RosterView } from '../components/views/RosterView';
import { StaffView } from '../components/views/StaffView';
import { AttendanceView } from '../components/views/AttendanceView';
import { TasksView } from '../components/views/TasksView';
import { WagesView } from '../components/views/WagesView';
import { SwapsView } from '../components/views/SwapsView';
import { InviteStaffModal } from '../components/modals/InviteStaffModal';
import { AIGeneratorModal } from '../components/modals/AIGeneratorModal';
import { EmailPreviewModal } from '../components/modals/EmailPreviewModal';
import { ShiftEditModal } from '../components/modals/ShiftEditModal';
import { SwapRequestModal } from '../components/modals/SwapRequestModal';
import { ShiftTemplateSettingsModal } from '../components/modals/ShiftTemplateSettingsModal';
import { CalendarExportModal } from '../components/modals/CalendarExportModal';
import { Shift, DayOfWeek } from '../types';

function RosterAppContent() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [defaultShiftDay, setDefaultShiftDay] = useState<DayOfWeek>('mon');

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [shiftToSwap, setShiftToSwap] = useState<Shift | null>(null);

  const handleOpenShiftModal = (shift?: Shift, defaultDay?: DayOfWeek) => {
    setEditingShift(shift || null);
    if (defaultDay) setDefaultShiftDay(defaultDay);
    setIsShiftModalOpen(true);
  };

  const handleOpenSwapModal = (shift: Shift) => {
    setShiftToSwap(shift);
    setIsSwapModalOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* 21st.dev Collapsible Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content App Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* TopBar Header with Mobile Hamburger, Breadcrumbs & Actions */}
        <TopBar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
        />

        {/* View Content Workspace */}
        <main className="flex-1 mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setCurrentTab}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              onOpenInviteModal={() => setIsInviteModalOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {currentTab === 'roster' && (
            <RosterView
              onOpenAiModal={() => setIsAiModalOpen(true)}
              onOpenShiftEditModal={handleOpenShiftModal}
              onOpenSwapModal={handleOpenSwapModal}
              onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {currentTab === 'staff' && (
            <StaffView onOpenInviteModal={() => setIsInviteModalOpen(true)} />
          )}

          {currentTab === 'attendance' && <AttendanceView />}

          {currentTab === 'tasks' && <TasksView />}

          {currentTab === 'wages' && <WagesView />}

          {currentTab === 'swaps' && <SwapsView />}
        </main>

        {/* Compact Clean Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Roster<span className="text-blue-600">Flow</span></span>
              <span>• Multi-Tenant Staff Roster & Workforce Management</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>Next.js 16</span>
              <span>•</span>
              <span>Supabase PostgreSQL</span>
              <span>•</span>
              <span>OpenRouter AI Engine</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Interactive Modals */}
      <InviteStaffModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <AIGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      <EmailPreviewModal />

      <ShiftEditModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shiftToEdit={editingShift}
        defaultDay={defaultShiftDay}
      />

      <SwapRequestModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        shiftToSwap={shiftToSwap}
      />

      <ShiftTemplateSettingsModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />

      <CalendarExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <RosterProvider>
      <RosterAppContent />
    </RosterProvider>
  );
}
