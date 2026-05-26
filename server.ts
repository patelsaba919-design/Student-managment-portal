/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { Student, AttendanceRecord, ActivityLog } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-key-student-management-secret';

app.use(express.json({ limit: '10mb' }));

// In-Memory Database mimicking MongoDB Document Model Collection Store with Default Seeds and dynamic writes
let studentsCollection: Student[] = [
  {
    id: '1',
    fullName: 'Amara Walker',
    rollNumber: 'CS-2026-001',
    email: 'amara.walker@university.edu',
    phoneNumber: '+1 (555) 102-3041',
    course: 'Computer Science',
    department: 'Engineering',
    semester: '6th',
    attendance: 92,
    address: '742 Evergreen Terrace, Springfield',
    dateOfBirth: '2004-03-12',
    profileImage: '',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    fullName: 'Julian Vance',
    rollNumber: 'EE-2026-042',
    email: 'julian.v@university.edu',
    phoneNumber: '+1 (555) 782-9012',
    course: 'Electrical Engineering',
    department: 'Engineering',
    semester: '4th',
    attendance: 84,
    address: '1012 Oakridge Ave, Austin',
    dateOfBirth: '2005-07-22',
    profileImage: '',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    fullName: 'Sophia Sterling',
    rollNumber: 'DS-2026-015',
    email: 'sophia.s@university.edu',
    phoneNumber: '+1 (555) 431-8899',
    course: 'Data Science',
    department: 'Computer Science',
    semester: '2nd',
    attendance: 96,
    address: '305 Marina Boulevard, San Francisco',
    dateOfBirth: '2006-01-15',
    profileImage: '',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    fullName: 'Marcus Aurelius',
    rollNumber: 'PH-2026-099',
    email: 'marcus.phil@university.edu',
    phoneNumber: '+1 (555) 123-4567',
    course: 'Philosophy',
    department: 'Humanities',
    semester: '8th',
    attendance: 78,
    address: '9 Via dei Fori Imperiali, Rome',
    dateOfBirth: '2003-11-01',
    profileImage: '',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    fullName: 'Elena Rostova',
    rollNumber: 'BT-2026-112',
    email: 'elena.rostova@university.edu',
    phoneNumber: '+1 (555) 991-2345',
    course: 'Biotechnology',
    department: 'Sciences',
    semester: '4th',
    attendance: 65,
    address: '45 Nevsky Prospekt, Saint Petersburg',
    dateOfBirth: '2005-09-18',
    profileImage: '',
    createdAt: new Date().toISOString()
  }
];

let attendanceCollection: AttendanceRecord[] = [
  ...studentsCollection.map(s => ({
    id: `att-${s.id}-${new Date().toISOString().split('T')[0]}`,
    studentId: s.id,
    date: new Date().toISOString().split('T')[0],
    status: (s.attendance > 80 ? 'Present' : s.attendance > 70 ? 'Late' : 'Absent') as 'Present' | 'Absent' | 'Late'
  }))
];

let activityLogsCollection: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'system',
    message: 'Student Management System Bootstrapped successfully with initial models.',
    adminName: 'System Admin'
  },
  {
    id: 'act-2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'attendance_marked',
    message: 'Auto-synchronized global semester register records.',
    adminName: 'Dean Desk'
  }
];

// Helper to log administrative operations
function addLog(type: ActivityLog['type'], message: string, adminName = 'Administrator') {
  const newLog: ActivityLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    type,
    message,
    adminName
  };
  activityLogsCollection.unshift(newLog);
  // Keep logs at a reasonable limit
  if (activityLogsCollection.length > 50) {
    activityLogsCollection.pop();
  }
}

// REST Middlewares
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired credentials token.' });
    }
    req.user = user;
    next();
  });
};

// API Endpoint Handlers
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  // Standard demo administrator credentials for simulation/academic review
  if (
    (username === 'admin' && password === 'admin123') ||
    (username === 'patelsaba919@gmail.com' && password === 'admin123')
  ) {
    const user = { username, role: 'Administrator', name: 'Saba Patel' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user });
  }
  return res.status(401).json({ error: 'Incorrect email/username or passcode.' });
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// Student Management CRUD
app.get('/api/students', authenticateToken, (req, res) => {
  res.json(studentsCollection);
});

app.get('/api/students/:id', authenticateToken, (req, res) => {
  const student = studentsCollection.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }
  res.json(student);
});

app.post('/api/students', authenticateToken, (req, res) => {
  const {
    fullName,
    rollNumber,
    email,
    phoneNumber,
    course,
    department,
    semester,
    attendance,
    address,
    dateOfBirth,
    profileImage
  } = req.body;

  if (!fullName || !rollNumber || !email) {
    return res.status(400).json({ error: 'Full name, roll number, and email are required fields.' });
  }

  const alreadyExists = studentsCollection.some(s => s.rollNumber.toLowerCase() === rollNumber.toLowerCase());
  if (alreadyExists) {
    return res.status(400).json({ error: 'Roll number already points to an active student.' });
  }

  const newStudent: Student = {
    id: Math.random().toString(36).substring(2, 9),
    fullName,
    rollNumber,
    email,
    phoneNumber: phoneNumber || '',
    course: course || 'Unhyphenated Science',
    department: department || 'General Education',
    semester: semester || '1st',
    attendance: Number(attendance) || 100,
    address: address || '',
    dateOfBirth: dateOfBirth || '2000-01-01',
    profileImage: profileImage || '',
    createdAt: new Date().toISOString()
  };

  studentsCollection.unshift(newStudent);
  addLog('student_added', `Registered new student ${fullName} (${rollNumber})`);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = studentsCollection.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Requested student not found.' });
  }

  const updatedStudent = {
    ...studentsCollection[index],
    ...req.body,
    id // force lock ID stability
  };

  studentsCollection[index] = updatedStudent;
  addLog('student_updated', `Modified details of ${updatedStudent.fullName} (${updatedStudent.rollNumber})`);
  res.json(updatedStudent);
});

app.delete('/api/students/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const student = studentsCollection.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student record unavailable.' });
  }

  studentsCollection = studentsCollection.filter(s => s.id !== id);
  attendanceCollection = attendanceCollection.filter(a => a.studentId !== id);
  addLog('student_deleted', `Withdrew record of ${student.fullName} (${student.rollNumber})`);
  res.json({ success: true, id });
});

// Attendance tracker module register
app.get('/api/attendance', authenticateToken, (req, res) => {
  res.json(attendanceCollection);
});

app.post('/api/attendance/mark', authenticateToken, (req, res) => {
  const { studentId, date, status, remarks } = req.body;
  if (!studentId || !status || !date) {
    return res.status(400).json({ error: 'Missing required fields for marking attendance.' });
  }

  const existingRecordIndex = attendanceCollection.findIndex(a => a.studentId === studentId && a.date === date);

  const updatedRecord: AttendanceRecord = {
    id: existingRecordIndex !== -1 ? attendanceCollection[existingRecordIndex].id : Math.random().toString(36).substring(2, 9),
    studentId,
    date,
    status,
    remarks: remarks || ''
  };

  if (existingRecordIndex !== -1) {
    attendanceCollection[existingRecordIndex] = updatedRecord;
  } else {
    attendanceCollection.unshift(updatedRecord);
  }

  // Recalculate dynamic cumulative attendance percentage for student
  const studentIndex = studentsCollection.findIndex(s => s.id === studentId);
  if (studentIndex !== -1) {
    const studentRecords = attendanceCollection.filter(a => a.studentId === studentId);
    const totalCount = studentRecords.length;
    const presentCount = studentRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const computedPercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;
    studentsCollection[studentIndex].attendance = computedPercentage;
  }

  addLog('attendance_marked', `Attendance for ${studentId} logged as ${status} on ${date}`);
  res.json({ success: true, record: updatedRecord });
});

// Activity logs timeline
app.get('/api/activities', authenticateToken, (req, res) => {
  res.json(activityLogsCollection);
});

// Dashboard metrics aggregate
app.get('/api/stats', authenticateToken, (req, res) => {
  const totalStudents = studentsCollection.length;
  const averageAttendance = totalStudents > 0
    ? Math.round(studentsCollection.reduce((acc, current) => acc + current.attendance, 0) / totalStudents)
    : 100;

  const courses = Array.from(new Set(studentsCollection.map(s => s.course)));
  const departments = Array.from(new Set(studentsCollection.map(s => s.department)));

  res.json({
    totalStudents,
    averageAttendance,
    courseCount: courses.length,
    departmentCount: departments.length,
    recentActivity: activityLogsCollection.slice(0, 8)
  });
});

// Initialize Dev server or static distributor
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Student Management] Server active on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
