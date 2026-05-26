/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string; // Dynamic UUID / ID string
  fullName: string;
  rollNumber: string;
  email: string;
  phoneNumber: string;
  course: string;
  department: string;
  semester: string;
  attendance: number; // Percentage (e.g. 85)
  address: string;
  dateOfBirth: string; // YYYY-MM-DD
  profileImage?: string; // Base64 data URI or placeholder URL
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'student_added' | 'student_updated' | 'student_deleted' | 'attendance_marked' | 'system';
  message: string;
  adminName: string;
}

export interface DashboardStats {
  totalStudents: number;
  averageAttendance: number;
  courseCount: number;
  departmentCount: number;
  recentActivity: ActivityLog[];
}
