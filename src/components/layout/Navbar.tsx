'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  Calendar,
  Clock,
  Users,
  CheckSquare,
  DollarSign,
  Sparkles,
  Bell,
  Share2,
  RefreshCw,
  Building2,
  ArrowRightLeft,
  ChevronDown,
  LayoutDashboard,
  Mail,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenInviteModal: () => void;
  onOpenAiModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenInviteModal,
  onOpenAiModal
}) => {
  const {
    businesses,
    currentBusiness,
    setCurrentBusiness,
    activeRole,
    setActiveRole,
    staffList,
    activeStaffId,
    setActiveStaffId,
    currentStaffProfile,
    notifications,
    markNotificationAsRead,
    setSelectedEmailPreview,
    resetToDefaultData
  } = useRoster();

  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roster', label: 'Roster Schedule', icon: Calendar },
    { id: 'staff', label: 'Staff & Room', icon: Users },
    { id: 'attendance', label: 'Attendance & Clock', icon: Clock },
    { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare },
    { id: 'wages', label: 'Hours & Wages', icon: DollarSign },
    { id: 'swaps', label: 'Shift Swaps', icon: ArrowRightLeft }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-xs">
      {/* Top Banner / Workspace Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-3">
          {/* Business Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 font-medium text-blue-900 border border-blue-200 hover:bg-blue-100/80 transition-colors shadow-2xs"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-semibold">{currentBusiness.name}</span>
              <span className="rounded bg-blue-200/60 px-1.5 py-0.5 text-[10px] text-blue-800 font-mono font-bold">
                {currentBusiness.inviteCode}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>

            {bizDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Select Workspace Room
                </div>
                {businesses.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setCurrentBusiness(b);
                      setBizDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
                      b.id === currentBusiness.id
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{b.name}</div>
                      <div className="text-[10px] text-slate-500">{b.businessType}</div>
                    </div>
                    <span className="font-mono text-[10px] text-blue-600 font-semibold">{b.inviteCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center text-slate-500">
            <span className="h-3 w-[1px] bg-slate-300 mx-2" />
            <span>Multi-Tenant Staff Roster SaaS</span>
          </div>
        </div>

        {/* Right side: Role Mode Switcher & Demo Tools */}
        <div className="flex items-center gap-3">
          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs border border-slate-200 hover:border-blue-400 transition-colors shadow-2xs"
            >
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-slate-500">Viewing as:</span>
              <span className="font-semibold text-slate-800 capitalize">
                {activeRole === 'owner' ? 'Owner / Manager' : `${currentStaffProfile?.name || 'Staff'}`}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Switch Active Role
                </div>
                <button
                  onClick={() => {
                    setActiveRole('owner');
                    setRoleDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors mb-1 ${
                    activeRole === 'owner'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-medium text-xs">Owner Dashboard (Navid)</div>
                    <div className="text-[10px] opacity-80">Full administrative controls, AI tools, wage rates</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100" />
                <div className="px-2 py-1 text-[10px] text-slate-500 font-medium">Test as Staff Member:</div>

                {staffList
                  .filter(s => s.status === 'active')
                  .map(staff => (
                    <button
                      key={staff.id}
                      onClick={() => {
                        setActiveRole('staff');
                        setActiveStaffId(staff.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                        activeRole === 'staff' && activeStaffId === staff.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <img src={staff.avatar} alt={staff.name} className="h-5 w-5 rounded-full object-cover" />
                      <div className="flex-1 truncate">
                        <div className="truncate font-medium">{staff.name}</div>
                        <div className="text-[10px] text-slate-500">{staff.jobTitle}</div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={resetToDefaultData}
            title="Reset to fresh demo dataset"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors p-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden md:inline text-[11px]">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 shadow-md shadow-blue-500/20">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">Roster<span className="text-blue-600">Flow</span></span>
              <span className="rounded-full bg-blue-100 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 -mt-0.5">AI Staff Roster & Operations</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/80">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          {/* Quick AI Trigger */}
          <button
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            <span className="hidden sm:inline">AI Roster</span>
          </button>

          {/* Deep link invite staff room */}
          <button
            onClick={onOpenInviteModal}
            className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
          >
            <Share2 className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Room Invite</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-2xs"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-900">Notifications & Emails</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{notifications.length} updates</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                        n.read ? 'opacity-70 hover:opacity-100 hover:bg-slate-50' : 'bg-blue-50/60 border border-blue-100 mb-1'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-slate-800">{n.title}</div>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                      {n.emailDetails && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedEmailPreview(n);
                            setNotifDropdownOpen(false);
                          }}
                          className="mt-2 flex items-center gap-1.5 rounded-md bg-blue-100 border border-blue-200 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-200/80 transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          <span>Preview Outgoing Email</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-200 gap-1 bg-white">
        {navLinks.map(link => {
          const Icon = link.icon;
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentTab(link.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
