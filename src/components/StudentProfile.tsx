/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  CalendarDays,
  Printer,
  ChevronLeft,
  User,
  HeartPulse
} from 'lucide-react';
import { motion } from 'motion/react';

interface StudentProfileProps {
  student: Student;
  onClose: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, onClose }) => {
  const { attendance, markAttendance } = useApp();

  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Late'>('Present');
  const [remarks, setRemarks] = useState('');

  // Sieve dynamic attendance dates associated with student
  const studentAttendanceList = attendance.filter(a => a.studentId === student.id);

  // Stats calculation
  const totalClasses = studentAttendanceList.length;
  const daysPresent = studentAttendanceList.filter(a => a.status === 'Present').length;
  const daysLate = studentAttendanceList.filter(a => a.status === 'Late').length;
  const daysAbsent = studentAttendanceList.filter(a => a.status === 'Absent').length;

  const handleMark = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await markAttendance(student.id, attendanceDate, attendanceStatus, remarks);
    if (success) {
      setRemarks('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id={`student-profile-sheet-${student.id}`} className="space-y-6 animate-fade-in print:p-0">
      
      {/* Visual Back actions row */}
      <div id="profile-controls-row" className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 print:hidden">
        <button
          id="back-to-table-btn"
          onClick={onClose}
          className="flex items-center gap-1.5 p-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-655 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Directory
        </button>

        <button
          id="print-profile-btn"
          onClick={handlePrint}
          className="flex items-center gap-1.5 p-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-655 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Export/Print PDF
        </button>
      </div>

      {/* Main visual sheet split */}
      <div id="profile-sheeting" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Card visual and metrics */}
        <div className="lg:col-span-4 space-y-6 print:col-span-12">
          
          {/* Main Visual Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center shadow-lg">
            {/* Visual Header Glow Decor */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-400" />
            
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={student.fullName}
                referrerPolicy="no-referrer"
                className="w-28 h-28 rounded-full object-cover shadow-md border-4 border-slate-100 dark:border-slate-800 mb-4 mt-2"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-linear-to-tr from-violet-500/10 to-cyan-500/10 border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-white text-4xl mb-4 mt-2">
                {student.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <h3 className="text-xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100">
              {student.fullName}
            </h3>
            <p className="text-xs font-mono font-bold text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-md mt-1 mb-4">
              {student.rollNumber}
            </p>

            {/* Micro Details Stack */}
            <div className="w-full space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate flex-grow text-left">{student.course}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate flex-grow text-left">{student.department} Department</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate flex-grow text-left">{student.semester} Semester</span>
              </div>
            </div>
          </div>

          {/* Core Attendance Ring Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xs flex flex-col items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 text-left w-full self-start">
              Attendance Health Ratio
            </h4>

            {/* Circular Ring Progress */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  strokeClassName="text-slate-100 dark:text-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                  className="stroke-slate-100 dark:stroke-slate-800"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={351.8}
                  strokeDashoffset={351.8 - (351.8 * student.attendance) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                  style={{
                    stroke: student.attendance >= 85 ? '#10b981' : student.attendance >= 75 ? '#fbbf24' : '#ef4444'
                  }}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-slate-800 dark:text-slate-50 font-sans">
                  {student.attendance}%
                </span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                  Cumulative
                </p>
              </div>
            </div>

            {/* Progress Segment indicators */}
            <div className="grid grid-cols-3 gap-2 w-full text-center text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
              <div className="flex flex-col">
                <span className="text-emerald-500 text-sm font-bold font-mono">{daysPresent}</span>
                <span className="text-[10px] text-slate-400">Present</span>
              </div>
              <div className="flex flex-col">
                <span className="text-yellow-500 text-sm font-bold font-mono">{daysLate}</span>
                <span className="text-[10px] text-slate-400">Late</span>
              </div>
              <div className="flex flex-col">
                <span className="text-red-500 text-sm font-bold font-mono">{daysAbsent}</span>
                <span className="text-[10px] text-slate-400">Absent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information tabs & Dynamic Record controls */}
        <div className="lg:col-span-8 space-y-6 print:col-span-12">
          
          {/* Detailed fields list sheet */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-4 flex items-center gap-1.5">
              <User className="w-4.5 h-4.5 text-violet-500" /> Student Profile Directory Sheet
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-655 dark:text-slate-300">
              
              {/* Email */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-850/50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-405 dark:text-slate-505 uppercase tracking-wider font-bold">Email Address</span>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{student.email}</span>
                </div>
              </div>

              {/* Phone */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-850/50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-405 dark:text-slate-505 uppercase tracking-wider font-bold">Mobile Phone</span>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{student.phoneNumber || 'N/A'}</span>
                </div>
              </div>

              {/* DOB */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-850/50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-405 dark:text-slate-505 uppercase tracking-wider font-bold">Date of Birth</span>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{student.dateOfBirth}</span>
                </div>
              </div>

              {/* Registration Date */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-850/50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-405 dark:text-slate-505 uppercase tracking-wider font-bold">Catalog Created At</span>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <HeartPulse className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate font-mono font-medium">
                    {new Date(student.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-850/50 rounded-xl space-y-1 sm:col-span-2">
                <span className="text-[10px] text-slate-405 dark:text-slate-505 uppercase tracking-wider font-bold">Registered Address</span>
                <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{student.address || 'No registered address data.'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mark Attendance Module inside profile card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xs print:hidden">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-4 flex items-center gap-1.5">
              <CalendarDays className="w-4.5 h-4.5 text-cyan-400 animate-pulse" /> Daily Register Tagger
            </h4>

            <form onSubmit={handleMark} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end text-xs font-medium">
              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Select Date</label>
                <input
                  id="mark-date"
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 focus:border-violet-500 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Status</label>
                <select
                  id="mark-status"
                  value={attendanceStatus}
                  onChange={e => setAttendanceStatus(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 focus:border-violet-500 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Optional Remarks</label>
                <input
                  id="mark-remarks"
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 focus:border-violet-500 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100"
                  placeholder="e.g. sick leave, late transit"
                />
              </div>

              <button
                type="submit"
                id="submit-mark-btn"
                className="sm:col-span-2 w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                Log Status
              </button>
            </form>
          </div>

          {/* Historical Register List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-4">
              Historical Register logs ({studentAttendanceList.length} logs)
            </h4>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1.5 font-sans font-medium text-xs">
              {studentAttendanceList.length > 0 ? (
                studentAttendanceList.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100/50 dark:border-slate-850/40 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {item.remarks && <p className="text-[10px] text-slate-400 italic">Notes: {item.remarks}</p>}
                    </div>

                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'Present'
                          ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600'
                          : item.status === 'Late'
                          ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600'
                          : 'bg-red-100 dark:bg-red-950/30 text-red-655'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 font-mono">No historical registers log filed.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
