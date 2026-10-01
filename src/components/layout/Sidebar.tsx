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
  UserCheck,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SparkleAiIcon, NotificationIcon } from '../ui/animated-state-icons';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenInviteModal: () => void;
  onOpenAiModal: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenInviteModal,
  onOpenAiModal,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const {
    isDbConnected,
    dbEngine,
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
    resetToDefaultData,
    roster,
    tasks,
    swapRequests
  } = useRoster();

  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const pendingSwaps = swapRequests.filter(s => s.status === 'pending_owner').length;
  const activeStaffCount = staffList.filter(s => s.status === 'active').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;

  const navCategories = [
    {
      label: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        {
          id: 'roster',
          label: 'Roster Schedule',
          icon: Calendar,
          badge: roster.status === 'published' ? 'Live' : 'Draft',
          badgeColor: roster.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        },
        {
          id: 'staff',
          label: 'Staff & Room',
          icon: Users,
          badge: `${activeStaffCount}`,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
        }
      ]
    },
    {
      label: 'Workforce Operations',
      items: [
        { id: 'attendance', label: 'Attendance & Clock', icon: Clock, badge: null },
        {
          id: 'tasks',
          label: 'Daily Tasks',
          icon: CheckSquare,
          badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
        },
        { id: 'wages', label: 'Hours & Wages', icon: DollarSign, badge: null },
        {
          id: 'swaps',
          label: 'Shift Swaps',
          icon: ArrowRightLeft,
          badge: pendingSwaps > 0 ? `${pendingSwaps}` : null,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
        }
      ]
    }
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden bg-white text-slate-800 select-none">
      {/* Top Section */}
      <div className="space-y-4 p-3">
        {/* Brand & Collapse Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100">
          <div
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-2.5 cursor-pointer ${isCollapsed ? 'justify-center w-full' : ''}`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 shadow-sm shadow-blue-500/20 text-white font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-slate-900">
                    Roster<span className="text-blue-600">Flow</span>
                  </span>
                  <span className="rounded-full bg-blue-100 border border-blue-200 px-1.5 py-0.2 text-[9px] font-bold text-blue-700">
                    SaaS
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate">Workforce OS</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              title="Collapse sidebar to icon rail"
              className="hidden lg:flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Workspace Room Switcher Card */}
        <div className="relative">
          <button
            onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
            className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-2 text-left hover:bg-blue-50/60 hover:border-blue-200 transition-all shadow-2xs ${
              isCollapsed ? 'justify-center p-2' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs">
                <Building2 className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">{currentBusiness.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Code: {currentBusiness.inviteCode}</div>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />}
          </button>

          {bizDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
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
                  <div className="truncate mr-2">
                    <div className="text-xs font-semibold truncate">{b.name}</div>
                    <div className="text-[10px] text-slate-500">{b.businessType}</div>
                  </div>
                  <span className="font-mono text-[10px] text-blue-600 font-bold shrink-0">{b.inviteCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick CTA Actions */}
        {!isCollapsed && (
          <div className="space-y-1.5 pt-1">
            <button
              onClick={onOpenAiModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 px-3 text-xs font-bold text-white shadow-sm transition-all glow-blue"
            >
              <SparkleAiIcon size={16} color="#FDE047" />
              <span>AI Roster Studio</span>
            </button>

            <button
              onClick={onOpenInviteModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-all"
            >
              <Share2 className="h-3.5 w-3.5 text-blue-600" />
              <span>Room Invite Link</span>
            </button>
          </div>
        )}

        {/* Navigation Categories */}
        <nav className="space-y-4 pt-2">
          {navCategories.map(cat => (
            <div key={cat.label} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {cat.label}
                </div>
              )}
              <div className="space-y-0.5">
                {cat.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                        isCollapsed ? 'justify-center px-2' : 'justify-between'
                      } ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-800'
                        }`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold border ${
                            item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User Profile, Role Toggle & Footer Section */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        {/* Expand Button if collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            title="Expand sidebar"
            className="flex w-full items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        {/* Role Switcher Popover */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-2 text-xs transition-colors hover:border-blue-300 shadow-2xs ${
              isCollapsed ? 'justify-center p-2' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {activeRole === 'owner' ? (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[11px]">
                  N
                </div>
              ) : (
                <img
                  src={currentStaffProfile?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'}
                  alt="Avatar"
                  className="h-7 w-7 shrink-0 rounded-full object-cover border border-slate-200"
                />
              )}
              {!isCollapsed && (
                <div className="truncate text-left">
                  <div className="truncate font-bold text-slate-800 text-xs">
                    {activeRole === 'owner' ? 'Navid (Owner)' : currentStaffProfile?.name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {activeRole === 'owner' ? 'Administrator' : currentStaffProfile?.jobTitle}
                  </div>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />}
          </button>

          {roleDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl z-50">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Simulate View Role
              </div>
              <button
                onClick={() => {
                  setActiveRole('owner');
                  setRoleDropdownOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors mb-1 ${
                  activeRole === 'owner'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="font-semibold text-xs">Owner Dashboard</div>
                  <div className="text-[10px] opacity-80">Rosters, AI tools, wage rates</div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-100" />
              <div className="px-2 py-1 text-[10px] text-slate-500 font-medium">Switch to Staff:</div>

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
                      <div className="truncate font-semibold">{staff.name}</div>
                      <div className="text-[10px] text-slate-500">{staff.jobTitle}</div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Secondary controls row */}
        {!isCollapsed && (
          <div className="flex items-center justify-between px-1 pt-1 text-xs text-slate-500">
            <button
              onClick={resetToDefaultData}
              title="Reset to fresh demo dataset"
              className="flex items-center gap-1.5 hover:text-slate-800 transition-colors p-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="text-[10px]">Reset Sample Data</span>
            </button>

            {/* 21st.dev Animated Notification Bell in Sidebar */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition-colors"
                title="Notifications"
              >
                <NotificationIcon size={16} active={unreadNotifs > 0} color="#64748b" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Notifications & Emails</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{notifications.length} updates</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 py-1">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          n.read ? 'opacity-70 hover:opacity-100 hover:bg-slate-50' : 'bg-blue-50/60 border border-blue-100 mb-1'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-semibold text-slate-800">{n.title}</div>
                          <span className="text-[9px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>

                        {n.emailDetails && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedEmailPreview(n);
                              setNotifDropdownOpen(false);
                            }}
                            className="mt-1.5 flex items-center gap-1.5 rounded-md bg-blue-100 border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-800 hover:bg-blue-200 transition-colors"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Preview Email</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PostgreSQL Internal Database Status Pill */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-1.5 py-1 text-[10px] text-slate-500 font-mono border-t border-slate-200/80 mt-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`h-2 w-2 rounded-full shrink-0 ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="truncate">{isDbConnected ? 'PostgreSQL (PGlite)' : 'Connecting DB...'}</span>
            </div>
            <span className="text-[9px] text-blue-700 font-sans font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
              Supabase Ready
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center py-1" title={isDbConnected ? 'PostgreSQL Active • Supabase Ready' : 'Connecting'}>
            <span className={`h-2 w-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out shrink-0 sticky top-0 h-screen z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
