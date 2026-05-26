/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AdminLogin } from './components/AdminLogin';
import { Sidebar } from './components/Sidebar';
import { Analytics } from './components/Analytics';
import { StudentTable } from './components/StudentTable';
import { StudentModal } from './components/StudentModal';
import { StudentProfile } from './components/StudentProfile';
import { AttendanceMarker } from './components/AttendanceMarker';
import { Toast } from './components/Toast';
import { Student } from './types';
import { GraduationCap, LogOut, Menu, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DashboardContent: React.FC = () => {
  const { admin, token, logout } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Directory routing states
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [studentForEdit, setStudentForEdit] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!token) {
    return <AdminLogin />;
  }

  // Quick shortcuts for student actions
  const handleEditStudent = (student: Student) => {
    setStudentForEdit(student);
    setIsModalOpen(true);
  };

  const handleAddStudent = () => {
    setStudentForEdit(null);
    setIsModalOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudentForView(student);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-250 relative overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Panel layout wrapper */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        {/* Dynamic decorative backdrop blurring spots strictly visual */}
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] rounded-full bg-linear-to-tr from-violet-600/5 to-cyan-500/5 blur-[120px] pointer-events-none" />

        {/* Top Navbar */}
        <header className="h-20 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between px-6 md:px-8 z-10 shrink-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
          {/* Menu Drawer Toggle on Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans leading-none tracking-tight">
              {activeTab === 'dashboard' && 'Administrative Console'}
              {activeTab === 'students' && 'Students Directory'}
              {activeTab === 'attendance' && 'Attendance Registry'}
            </h1>
          </div>

          <div className="md:hidden flex items-center gap-1.5">
            <button
              id="mobile-drawer-toggle-sub"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1 px-2.5 bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Menu
            </button>
          </div>

          {/* User badge + operations */}
          {admin && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline-block">
                Currently tracking: <strong className="text-slate-700 dark:text-slate-200">{admin.name}</strong>
              </span>
              <div className="w-8 h-8 rounded-full bg-violet-605 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100 dark:ring-slate-800 uppercase">
                {admin.name.slice(0, 2)}
              </div>
            </div>
          )}
        </header>

        {/* Route Panels Content viewport */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto z-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedStudentForView ? `-view-${selectedStudentForView.id}` : '-list')}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Analytics setActiveTab={setActiveTab} />}

              {activeTab === 'students' && (
                <>
                  {selectedStudentForView ? (
                    <StudentProfile
                      student={selectedStudentForView}
                      onClose={() => setSelectedStudentForView(null)}
                    />
                  ) : (
                    <StudentTable
                      onAddClick={handleAddStudent}
                      onEditClick={handleEditStudent}
                      onViewClick={handleViewStudent}
                    />
                  )}
                </>
              )}

              {activeTab === 'attendance' && <AttendanceMarker />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Adding / Editing Modal Sheet */}
      <AnimatePresence>
        {isModalOpen && (
          <StudentModal
            student={studentForEdit}
            onClose={() => {
              setIsModalOpen(false);
              setStudentForEdit(null);
            }}
          />
        )}
      </AnimatePresence>

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
