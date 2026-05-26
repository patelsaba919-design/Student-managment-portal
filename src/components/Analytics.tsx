/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  GraduationCap,
  CalendarDays,
  Activity,
  ArrowUpRight,
  UserCheck,
  TrendingUp,
  CircleDot
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const Analytics: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { stats, students, activities } = useApp();

  // Create mock charts datasets dynamically from students state
  const courseCounts = students.reduce((acc: { [key: string]: number }, s) => {
    acc[s.course] = (acc[s.course] || 0) + 1;
    return acc;
  }, {});

  const courseChartData = Object.entries(courseCounts).map(([name, value]) => ({
    name,
    students: value
  }));

  const depAttendance = students.reduce<Record<string, { totalAt: number; count: number }>>((acc, s) => {
    if (!acc[s.department]) acc[s.department] = { totalAt: 0, count: 0 };
    acc[s.department].totalAt += s.attendance;
    acc[s.department].count += 1;
    return acc;
  }, {});

  const depAttendanceChartData = Object.entries(depAttendance).map(([name, stat]) => {
    const s = stat as { totalAt: number; count: number };
    return {
      name,
      attendance: Math.round(s.totalAt / s.count)
    };
  });

  const COLORS = ['#818cf8', '#22d3ee', '#34d399', '#f43f5e', '#fbbf24', '#a78bfa'];

  // Card items config
  const statCards = [
    {
      id: 'stat-total-students',
      label: 'Enrolled Students',
      value: stats.totalStudents,
      prevLabel: '+12% from last term',
      icon: Users,
      gradient: 'from-violet-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-violet-500/20',
      iconColor: 'text-violet-400',
      accentColor: '#818cf8',
      tab: 'students'
    },
    {
      id: 'stat-average-attendance',
      label: 'Average Attendance',
      value: `${stats.averageAttendance}%`,
      prevLabel: 'Stable register level',
      icon: UserCheck,
      gradient: 'from-cyan-500/10 via-teal-500/5 to-transparent',
      borderColor: 'border-cyan-500/20',
      iconColor: 'text-cyan-400',
      accentColor: '#22d3ee',
      tab: 'attendance'
    },
    {
      id: 'stat-courses',
      label: 'Active Courses',
      value: stats.courseCount,
      prevLabel: 'Across 6 faculties',
      icon: GraduationCap,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      accentColor: '#34d399',
      tab: 'students'
    },
    {
      id: 'stat-departments',
      label: 'Departments',
      value: stats.departmentCount,
      prevLabel: 'Active campus houses',
      icon: CalendarDays,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400',
      accentColor: '#fbbf24',
      tab: 'students'
    }
  ];

  // Helper formatting for activities
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_added':
        return <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-450"><Users className="w-4 h-4" /></div>;
      case 'student_deleted':
        return <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-450"><Activity className="w-4 h-4" /></div>;
      case 'attendance_marked':
        return <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-450"><CalendarDays className="w-4 h-4" /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-450"><CircleDot className="w-4 h-4" /></div>;
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Some time ago';
    }
  };

  return (
    <div id="analytics-portal-container" className="space-y-8 animate-fade-in">
      
      {/* Welcome Hero Banner */}
      <div id="dashboard-welcome-banner" className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        {/* Decorative lighting bubbles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-violet-650/10 blur-[90px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-60 h-60 rounded-full bg-cyan-500/5 blur-[80px] -mb-20 pointer-events-none" />

        <div className="space-y-2 z-10">
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
            Dashboard Overview
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Track and manage student catalogs, classroom attendance ratios, course logs, and administrative timelines inside an integrated workspace.
          </p>
        </div>

        <button
          id="quick-add-student-shortcut"
          onClick={() => setActiveTab('students')}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-violet-500/15 cursor-pointer z-10 shrink-0"
        >
          Manage Registrations <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats KPI Metric Grid with customized layout */}
      <div id="stats-kpi-gird" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              id={card.id}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => setActiveTab(card.tab)}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 backdrop-blur-xl shadow-xs hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 ${card.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                  {card.value}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {card.prevLabel}
                </p>
              </div>

              {/* Spark bar representation strictly visual */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-linear-to-r from-violet-500 to-cyan-400 rounded-full"
                  style={{ width: typeof card.value === 'number' ? `${Math.min(100, (card.value / 12) * 100)}%` : '85%' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Dynamic Charts */}
      <div id="analytics-charts-split" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Attendance Area Map */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150 tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-violet-500" /> Attendance by Faculty
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mean ratio calculated across dynamic semester groups</p>
            </div>
          </div>

          <div id="department-attendance-chart" className="w-full h-80">
            {depAttendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={depAttendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3042" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#a0aec0" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="attendance" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorAt)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Not enough data to calculate graphs.</div>
            )}
          </div>
        </div>

        {/* Course Popularity Share */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150 tracking-tight flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" /> Course Enrolment Share
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total student headcounts relative share contribution</p>
          </div>

          <div id="course-recharts-chart" className="w-full h-64 flex items-center justify-center relative">
            {courseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="students"
                  >
                    {courseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Enrol some students to preview metrics.</div>
            )}

            {/* Central Badge */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xs text-slate-400">Total Headcount</span>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 font-sans">{students.length}</p>
            </div>
          </div>

          {/* Simple Grid Legends */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-medium">
            {courseChartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate flex-grow">{item.name}</span>
                <span className="text-slate-400 font-mono">{item.students}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Panel */}
      <div id="activities-timeline-block" className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="p-2 bg-violet-500/10 rounded-xl">
            <Activity className="w-5 h-5 text-violet-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Chronological Logs Activity</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live administrative operations audit trail</p>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {activities.length > 0 ? (
            activities.map((act, index) => (
              <div key={act.id} className="flex gap-4 relative group">
                {/* Visual Connector Line */}
                {index !== activities.length - 1 && (
                  <span className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800/80 group-hover:bg-violet-750 transition-colors" />
                )}

                <div className="relative z-10">{getActivityIcon(act.type)}</div>

                <div className="flex-grow flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-slate-50/50 dark:bg-slate-850/10 border border-slate-100/40 dark:border-slate-850/60 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-all">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-normal">
                      {act.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                      <span>Logged by:</span>
                      <strong className="text-slate-600 dark:text-slate-400">{act.adminName}</strong>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-450 whitespace-nowrap bg-slate-100 dark:bg-slate-800/40 px-2.5 py-1 rounded-full shrink-0">
                    {getRelativeTime(act.timestamp)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-400 font-mono">No chronological records available.</div>
          )}
        </div>
      </div>
    </div>
  );
};
