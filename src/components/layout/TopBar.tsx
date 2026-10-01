'use client';

import React from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  Menu,
  Sparkles,
  Share2,
  Bell,
  Search,
  Building2,
  Calendar,
  Clock,
  Users,
  CheckSquare,
  DollarSign,
  ArrowRightLeft,
  LayoutDashboard
} from 'lucide-react';
import { NotificationIcon, SparkleAiIcon, MenuCloseIcon } from '../ui/animated-state-icons';

interface TopBarProps {
  currentTab: string;
  onOpenMobileSidebar: () => void;
  onOpenAiModal: () => void;
  onOpenInviteModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenAiModal,
  onOpenInviteModal
}) => {
  const { currentBusiness, activeRole, currentStaffProfile, notifications, setSelectedEmailPreview } = useRoster();

  const tabLabels: Record<string, { title: string; subtitle: string; icon: React.ElementType }> = {
    dashboard: { title: 'Workforce Dashboard', subtitle: `Live operations for ${currentBusiness.name}`, icon: LayoutDashboard },
    roster: { title: 'Staff Roster Schedule', subtitle: 'Weekly shift assignments and coverage planning', icon: Calendar },
    staff: { title: 'Staff Directory & Room', subtitle: 'Hourly wages, limits, and availability matrix', icon: Users },
    attendance: { title: 'Attendance & Timeclock', subtitle: 'Verified check-ins, breaks, and hours tracking', icon: Clock },
    tasks: { title: 'Daily Shift Tasks', subtitle: 'Opening, mid-day, and closing operation checklists', icon: CheckSquare },
    wages: { title: 'Hours & Wage Calculator', subtitle: 'Estimated payroll compensation and hours summary', icon: DollarSign },
    swaps: { title: 'Shift Swap Approvals', subtitle: 'Peer shift exchanges and manager sign-offs', icon: ArrowRightLeft }
  };

  const currentInfo = tabLabels[currentTab] || tabLabels.dashboard;
  const TabIcon = currentInfo.icon;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileSidebar}
          className="flex lg:hidden rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Open Menu"
        >
          <MenuCloseIcon size={18} color="currentColor" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <TabIcon className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
              {currentInfo.title}
            </h1>
            <p className="hidden md:block text-[11px] text-slate-500 mt-0.5 leading-none">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Room Code Badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs text-blue-800 font-semibold font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>{currentBusiness.inviteCode}</span>
        </div>

        {/* 21st.dev Animated Notification Bell */}
        {notifications.length > 0 && (
          <button
            onClick={() => {
              if (notifications[0]) setSelectedEmailPreview(notifications[0]);
            }}
            className="relative flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
            title={`${unreadCount} notifications`}
          >
            <NotificationIcon size={18} active={unreadCount > 0} color="#334155" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
        )}

        {/* AI Generator Quick Trigger */}
        {activeRole === 'owner' && (
          <button
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all"
          >
            <SparkleAiIcon size={16} color="#FDE047" />
            <span className="hidden sm:inline">AI Roster</span>
          </button>
        )}

        {/* Deep Link Invite Button */}
        <button
          onClick={onOpenInviteModal}
          className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-all"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden sm:inline">Invite Staff</span>
        </button>

        {/* Viewing As Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
          <span className="text-[10px] text-slate-500 font-medium">Role:</span>
          <span className="font-semibold text-slate-900 capitalize">
            {activeRole === 'owner' ? 'Owner' : currentStaffProfile?.name}
          </span>
        </div>
      </div>
    </header>
  );
};
