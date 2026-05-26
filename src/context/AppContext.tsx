/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, AttendanceRecord, ActivityLog, DashboardStats } from '../types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  token: string | null;
  admin: { name: string; username: string; role: string } | null;
  students: Student[];
  attendance: AttendanceRecord[];
  activities: ActivityLog[];
  stats: DashboardStats;
  theme: 'light' | 'dark';
  isLoading: boolean;
  login: (username: string, passcode: string) => Promise<boolean>;
  logout: () => void;
  fetchDashboardData: () => Promise<void>;
  addStudent: (studentData: Omit<Student, 'id' | 'createdAt'>) => Promise<boolean>;
  updateStudent: (id: string, studentData: Partial<Student>) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  markAttendance: (studentId: string, date: string, status: 'Present' | 'Absent' | 'Late', remarks?: string) => Promise<boolean>;
  toggleTheme: () => void;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sms_auth_token'));
  const [admin, setAdmin] = useState<AppContextType['admin']>(() => {
    const saved = localStorage.getItem('sms_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    averageAttendance: 100,
    courseCount: 0,
    departmentCount: 0,
    recentActivity: []
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('sms_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Apply theme to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sms_theme', theme);
  }, [theme]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Math.random().toString(36).substring(2, 9),
      message,
      type
    });
  };

  const clearToast = () => setToast(null);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    showToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  const login = async (username: string, passcode: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: passcode })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication parameters invalid.');
      }

      localStorage.setItem('sms_auth_token', data.token);
      localStorage.setItem('sms_auth_user', JSON.stringify(data.user));
      setToken(data.token);
      setAdmin(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      setIsLoading(false);
      return true;
    } catch (err: any) {
      showToast(err.message || 'Login failed.', 'error');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('sms_auth_token');
    localStorage.removeItem('sms_auth_user');
    setToken(null);
    setAdmin(null);
    setStudents([]);
    setAttendance([]);
    setActivities([]);
    showToast('Administrator session closed successfully.', 'info');
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [studentsRes, attendanceRes, activitiesRes, statsRes] = await Promise.all([
        fetch('/api/students', { headers }),
        fetch('/api/attendance', { headers }),
        fetch('/api/activities', { headers }),
        fetch('/api/stats', { headers })
      ]);

      if (studentsRes.status === 401 || studentsRes.status === 403) {
        logout();
        return;
      }

      const studentsData = await studentsRes.json();
      const attendanceData = await attendanceRes.json();
      const activitiesData = await activitiesRes.json();
      const statsData = await statsRes.json();

      setStudents(studentsData);
      setAttendance(attendanceData);
      setActivities(activitiesData);
      setStats(statsData);
    } catch (err) {
      showToast('Error syncing stats with database.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data automatically when Token is activated
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(studentData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit registration data.');
      }

      showToast(`Student ${data.fullName} registered successfully!`, 'success');
      await fetchDashboardData();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(studentData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Update failed.');
      }

      showToast(`Record updated for ${data.fullName}`, 'success');
      await fetchDashboardData();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Update failed.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove student.');
      }

      showToast('Student record withdrawn successfully.', 'info');
      await fetchDashboardData();
      return true;
    } catch (err: any) {
      showToast(err.message || 'De-registration failed.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const markAttendance = async (
    studentId: string,
    date: string,
    status: 'Present' | 'Absent' | 'Late',
    remarks?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, date, status, remarks })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Attendance logging failed.');
      }

      await fetchDashboardData();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Attendance error.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        token,
        admin,
        students,
        attendance,
        activities,
        stats,
        theme,
        isLoading,
        login,
        logout,
        fetchDashboardData,
        addStudent,
        updateStudent,
        deleteStudent,
        markAttendance,
        toggleTheme,
        toast,
        showToast,
        clearToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
