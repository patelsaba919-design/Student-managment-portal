/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean; // collapsed layout state on desktop
  setIsOpen: (open: boolean) => void;
  mobileOpen: boolean; // toggle state on mobile
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  mobileOpen,
  setMobileOpen
}) => {
  const { admin, logout, students } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Directory', icon: Users, badge: students.length },
    { id: 'attendance', label: 'Attendance Marker', icon: CalendarCheck }
  ];

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false); // close modal drawers automatically
  };

  const sidebarContent = (isMobileLayout: boolean) => {
    const showLabels = isOpen || isMobileLayout;

    return (
      <div className="h-full flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800">
        {/* Brand Banner */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5.5 h-5.5 text-white" />
            </div>
            {showLabels && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  SMS PANEL
                </span>
                <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                  v1.2.0
                </span>
              </motion.div>
            )}
          </div>

          {/* Close Buttons for Desktop and Mobile */}
          {isMobileLayout ? (
            <button
              id="mobile-nav-close-btn"
              onClick={() => setMobileOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              id="desktop-nav-toggle-btn"
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors hidden md:block cursor-pointer"
            >
              {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Admin Profile segment */}
        {showLabels && admin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 mx-4 my-4 rounded-xl bg-slate-950/40 border border-slate-800/40 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm uppercase ring-2 ring-slate-800">
              {admin.name.slice(0, 2)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-white truncate">{admin.name}</span>
              <span className="text-[10px] text-slate-400 truncate">{admin.role}</span>
            </div>
          </motion.div>
        )}

        {/* Navigation list */}
        <nav className="flex-grow px-3 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/10 to-cyan-500/10 text-cyan-400 border border-violet-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
                }`}
              >
                {/* Active left bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-0.75 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-r-md" />
                )}

                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />

                {showLabels && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-grow text-left"
                  >
                    {item.label}
                  </motion.span>
                )}

                {/* Badge item */}
                {showLabels && item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-650 text-white min-w-5 text-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer actions */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2 px-2">
            {showLabels && <span className="text-xs text-slate-500 font-medium">Appearance</span>}
            <ThemeToggle />
          </div>

          <button
            id="nav-logout-btn"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {showLabels && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Trigger (Sticky Bar) */}
      <div id="mobile-top-bar" className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
        <button
          id="mobile-nav-toggle-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 hover:bg-slate-800 rounded transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-1.5">
          <GraduationCap className="w-5.5 h-5.5 text-cyan-400" />
          <span className="text-sm font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            SMS PANEL
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Mobile Off-canvas Drawer Navigation overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div id="mobile-drawer-portal" className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop filter overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            
            {/* Nav Panel drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 max-w-sm h-full shadow-2xl z-10"
            >
              {sidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Layout */}
      <aside
        id="desktop-sidebar-container"
        className={`hidden md:flex flex-col h-screen h-sticky top-0 shrink-0 transition-all duration-350 ease-out z-10 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
};
