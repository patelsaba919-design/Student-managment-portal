/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Check, ClipboardList, Info, AlertTriangle, Send } from 'lucide-react';
import { motion } from 'motion/react';

export const AttendanceMarker: React.FC = () => {
  const { students, attendance, markAttendance, showToast } = useApp();

  const [selectedCourse, setSelectedCourse] = useState('Computer Science');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remarksState, setRemarksState] = useState<{ [studentId: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Dynamic course list
  const coursesList = useMemo(() => {
    return Array.from(new Set(students.map(s => s.course)));
  }, [students]);

  // Sieve students enrolled in this course
  const courseStudents = useMemo(() => {
    return students.filter(s => s.course === selectedCourse);
  }, [students, selectedCourse]);

  // Extract recorded attendance for current date & course
  const currentRegisterState = useMemo(() => {
    const registry: { [studentId: string]: 'Present' | 'Absent' | 'Late' } = {};
    courseStudents.forEach(cs => {
      const match = attendance.find(a => a.studentId === cs.id && a.date === selectedDate);
      if (match) {
        registry[cs.id] = match.status;
      } else {
        registry[cs.id] = 'Present'; // default to Present if unrecorded
      }
    });
    return registry;
  }, [courseStudents, attendance, selectedDate]);

  // Local state to hold temporary status before committing file
  const [localRegistry, setLocalRegistry] = useState<{ [studentId: string]: 'Present' | 'Absent' | 'Late' }>({});

  // Sync local changes on dates/course transformations
  React.useEffect(() => {
    setLocalRegistry(currentRegisterState);
  }, [currentRegisterState]);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setLocalRegistry(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleBulkMark = (status: 'Present' | 'Absent' | 'Late') => {
    const updated: typeof localRegistry = {};
    courseStudents.forEach(s => {
      updated[s.id] = status;
    });
    setLocalRegistry(updated);
    showToast(`Draft marked all as ${status}`, 'info');
  };

  const handleSubmitRegister = async () => {
    if (courseStudents.length === 0) {
      showToast('No students enrolled in this course program.', 'error');
      return;
    }

    setLoading(true);
    try {
      const promises = courseStudents.map(student => {
        const status = localRegistry[student.id] || 'Present';
        const remarks = remarksState[student.id] || '';
        return markAttendance(student.id, selectedDate, status, remarks);
      });

      await Promise.all(promises);
      showToast('Attendance register active session saved successfully', 'success');
    } catch {
      showToast('Could not save registry logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="attendance-register-container" className="space-y-6">
      
      {/* Search selection toolbar */}
      <div id="register-header" className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row md:items-end justify-between gap-4 font-sans font-medium text-xs">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow max-w-xl">
          {/* Select Course Program */}
          <div className="space-y-1.5Col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Faculty Course/Program</span>
            <select
              id="attendance-program-select"
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
            >
              {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Select Date */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Select Session Date</span>
            <input
              id="attendance-session-date"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-end">
          <button
            id="bulk-present-btn"
            onClick={() => handleBulkMark('Present')}
            className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 hover:bg-emerald-555/20 rounded-xl transition-all font-bold text-[10px] uppercase cursor-pointer"
          >
            All Present
          </button>
          <button
            id="bulk-absent-btn"
            onClick={() => handleBulkMark('Absent')}
            className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-650 hover:bg-red-555/20 rounded-xl transition-all font-bold text-[10px] uppercase cursor-pointer"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Main Students mark card sheet */}
      <div id="attendance-marker-card" className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden backdrop-blur-xl shadow-xs">
        
        <div id="attendance-marker-legend" className="p-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-850/30 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-violet-500" />
            <span>Students marking Sheet ({courseStudents.length})</span>
          </div>
          <span>Status controls</span>
        </div>

        {courseStudents.length === 0 ? (
          <div id="attendance-empty" className="p-14 text-center">
            <p className="text-sm text-slate-400 font-mono mt-1">No active student registrees inside this faculty track yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[50vh] overflow-y-auto">
            {courseStudents.map(student => {
              const activeStatus = localRegistry[student.id] || 'Present';
              return (
                <div
                  key={student.id}
                  id={`mark-row-${student.id}`}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-850/10 transition-colors"
                >
                  {/* Name column info */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center shrink-0 text-xs text-slate-700 dark:text-slate-300">
                      {student.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-150 leading-normal">
                        {student.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{student.rollNumber}</span>
                    </div>
                  </div>

                  {/* Operational status action choices & Notes */}
                  <div className="flex flex-wrap items-center gap-3 ml-0 sm:ml-auto">
                    {/* Notes field */}
                    <input
                      id={`mark-remarks-${student.id}`}
                      type="text"
                      value={remarksState[student.id] || ''}
                      onChange={e => setRemarksState({ ...remarksState, [student.id]: e.target.value })}
                      className="p-1.5 px-3 bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none w-full sm:w-44 placeholder-slate-400 dark:placeholder-slate-505"
                      placeholder="Optional Remarks"
                    />

                    {/* Operational Toggles */}
                    <div className="flex items-center bg-slate-100/60 dark:bg-slate-850 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      {(['Present', 'Late', 'Absent'] as const).map(st => {
                        const isChosen = activeStatus === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            id={`tag-${student.id}-${st}`}
                            onClick={() => handleStatusChange(student.id, st)}
                            className={`p-1.5 px-3.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              isChosen
                                ? st === 'Present'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : st === 'Late'
                                  ? 'bg-yellow-500 text-white shadow-xs'
                                  : 'bg-red-550 text-white shadow-xs'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action submit button */}
        <div id="attendance-footer-bar" className="p-4 bg-slate-50/50 dark:bg-slate-850/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Ensure logs are filled prior to submitting ledger.</span>
          </div>

          <button
            id="attendance-ledger-submit-btn"
            onClick={handleSubmitRegister}
            disabled={loading || courseStudents.length === 0}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Commit Register Log
          </button>
        </div>
      </div>
    </div>
  );
};
