/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Plus,
  ArrowUpDown,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Printer
} from 'lucide-react';
import { motion } from 'motion/react';

interface StudentTableProps {
  onAddClick: () => void;
  onEditClick: (student: Student) => void;
  onViewClick: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  onAddClick,
  onEditClick,
  onViewClick
}) => {
  const { students, deleteStudent, isLoading } = useApp();

  // Search, Sort & Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL'); // ALL, CRITICAL (<75%), HIGH (>=85%)
  const [sortBy, setSortBy] = useState<keyof Student>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Derive courses and departments dynamically for filter listings
  const filterOptions = useMemo(() => {
    const courses = Array.from(new Set(students.map(s => s.course)));
    const departments = Array.from(new Set(students.map(s => s.department)));
    return { courses, departments };
  }, [students]);

  // Execute Dynamic filtering and search matches
  const processedStudents = useMemo(() => {
    let filtered = [...students];

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.fullName.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    // Course filters
    if (courseFilter !== 'ALL') {
      filtered = filtered.filter(s => s.course === courseFilter);
    }

    // Department filters
    if (deptFilter !== 'ALL') {
      filtered = filtered.filter(s => s.department === deptFilter);
    }

    // Attendance filters
    if (attendanceFilter === 'CRITICAL') {
      filtered = filtered.filter(s => s.attendance < 75);
    } else if (attendanceFilter === 'HIGH') {
      filtered = filtered.filter(s => s.attendance >= 85);
    }

    // Sort operations
    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [students, searchQuery, courseFilter, deptFilter, attendanceFilter, sortBy, sortDirection]);

  // Paginated chunk
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedStudents.slice(startIndex, startIndex + rowsPerPage);
  }, [processedStudents, currentPage]);

  const totalPages = Math.max(1, Math.ceil(processedStudents.length / rowsPerPage));

  // Auto fallback if current page is out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSort = (field: keyof Student) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage < 75) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
          <AlertTriangle className="w-3 h-3" /> {percentage}% Critical
        </span>
      );
    }
    if (percentage < 85) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-950/40 text-yellow-750 dark:text-yellow-400">
          {percentage}% Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
        {percentage}% Good
      </span>
    );
  };

  const exportCSV = () => {
    const headers = [
      'Full Name',
      'Roll Number',
      'Email',
      'Phone Number',
      'Course',
      'Department',
      'Semester',
      'Attendance Percentage',
      'DOB',
      'Address',
      'Registered Date'
    ];

    const rows = processedStudents.map(s => [
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.rollNumber}"`,
      s.email,
      `"${s.phoneNumber}"`,
      `"${s.course}"`,
      `"${s.department}"`,
      s.semester,
      `${s.attendance}%`,
      s.dateOfBirth,
      `"${s.address.replace(/"/g, '""')}"`,
      s.createdAt
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Directory_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div id="student-directory-container" className="space-y-6">
      
      {/* Search and Filters Header bar */}
      <div id="table-controls-banner" className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 backdrop-blur-xl shadow-xs flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        
        {/* Dynamic Search Box with transition icon */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="w-5 h-5 pointer-events-none" />
          </span>
          <input
            id="student-search-input"
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-100 outline-none transition-all duration-200"
            placeholder="Search students by name, roll, or email..."
          />
        </div>

        {/* Action utility row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print Registry */}
          <button
            id="print-registry-shortcut"
            onClick={handlePrintAll}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Print entire catalog"
          >
            <Printer className="w-4 h-4" /> Print Register
          </button>

          {/* Export spreadsheet Excel compatible */}
          <button
            id="export-csv-spreadsheet-btn"
            onClick={exportCSV}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Download CSV database file"
          >
            <Download className="w-4 h-4" /> Export CSV (Excel)
          </button>

          {/* Core Master Add Student trigger button */}
          <button
            id="enroll-student-btn"
            onClick={onAddClick}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-md shadow-violet-500/10 hover:shadow-lg transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" /> Register Student
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div id="table-filter-toolbar" className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 backdrop-blur-md flex flex-wrap items-center gap-4 text-xs font-medium">
        <span className="text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-bold text-[10px]">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* Dept Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-550">Dept:</span>
          <select
            id="dept-filter-select"
            value={deptFilter}
            onChange={e => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-1 px-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 outline-none hover:border-slate-300 cursor-pointer text-xs"
          >
            <option value="ALL">All Departments</option>
            {filterOptions.departments.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Course Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-550">Course:</span>
          <select
            id="course-filter-select"
            value={courseFilter}
            onChange={e => {
              setCourseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-1 px-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 outline-none hover:border-slate-300 cursor-pointer text-xs"
          >
            <option value="ALL">All Courses</option>
            {filterOptions.courses.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Attendance Filters */}
        <div className="flex items-center gap-2">
          <span className="text-slate-550">Attendance:</span>
          <select
            id="attendance-filter-select"
            value={attendanceFilter}
            onChange={e => {
              setAttendanceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-1 px-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 outline-none hover:border-slate-300 cursor-pointer text-xs"
          >
            <option value="ALL">All Attendance levels</option>
            <option value="CRITICAL">Critical (&lt; 75%)</option>
            <option value="HIGH">Good (&gt;= 85%)</option>
          </select>
        </div>

        {/* Clear Filters helper button */}
        {(courseFilter !== 'ALL' || deptFilter !== 'ALL' || attendanceFilter !== 'ALL' || searchQuery !== '') && (
          <button
            id="reset-all-filters-btn"
            onClick={() => {
              setCourseFilter('ALL');
              setDeptFilter('ALL');
              setAttendanceFilter('ALL');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="text-red-500 hover:text-red-600 dark:hover:text-red-400 ml-auto transition-colors font-bold uppercase tracking-wider text-[10px] cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Student Directory Data Table */}
      <div id="table-sheet-card" className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden backdrop-blur-xl shadow-xs">
        
        {isLoading ? (
          <div id="table-skeleton-loader" className="p-8 space-y-4">
            <div className="h-6 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg w-full" />
            <div className="h-10 bg-slate-100/65 dark:bg-slate-800/65 animate-pulse rounded-lg w-full" />
            <div className="h-10 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse rounded-lg w-full" />
            <div className="h-10 bg-slate-100/40 dark:bg-slate-800/40 animate-pulse rounded-lg w-full" />
          </div>
        ) : paginatedStudents.length === 0 ? (
          <div id="table-empty-fallback" className="p-14 text-center">
            <p className="text-sm text-slate-400 font-mono mt-2">
              No students found matching current filters or query settings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
                  <th
                    className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-650"
                    onClick={() => handleSort('fullName')}
                  >
                    <span className="flex items-center gap-1">
                      Full Name <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                  </th>
                  <th
                    className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-650"
                    onClick={() => handleSort('rollNumber')}
                  >
                    <span className="flex items-center gap-1">
                      Roll Number <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                  </th>
                  <th
                    className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-650"
                    onClick={() => handleSort('course')}
                  >
                    <span className="flex items-center gap-1">
                      Program/Course <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                  </th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Semester
                  </th>
                  <th
                    className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-650"
                    onClick={() => handleSort('attendance')}
                  >
                    <span className="flex items-center gap-1">
                      Attendance <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                  </th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-550 text-right pr-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedStudents.map(student => (
                  <tr
                    key={student.id}
                    id={`student-row-${student.id}`}
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors"
                  >
                    {/* Visual profile details cell */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {student.profileImage ? (
                          <img
                            src={student.profileImage}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-100 dark:ring-slate-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500/15 to-cyan-500/15 flex items-center justify-center font-bold text-slate-800 dark:text-white shrink-0">
                            {student.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {student.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">{student.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Roll No */}
                    <td className="p-4 text-xs font-mono font-bold text-slate-700 dark:text-slate-350">
                      {student.rollNumber}
                    </td>

                    {/* Department / Course */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {student.course}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {student.department}
                        </span>
                      </div>
                    </td>

                    {/* Semester */}
                    <td className="p-4 text-xs font-semibold text-slate-850 dark:text-slate-350">
                      {student.semester}
                    </td>

                    {/* Attendance status */}
                    <td className="p-4">{getAttendanceBadge(student.attendance)}</td>

                    {/* Action buttons */}
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`view-student-${student.id}`}
                          onClick={() => onViewClick(student)}
                          className="p-1 px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="View complete profile card"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`edit-student-${student.id}`}
                          onClick={() => onEditClick(student)}
                          className="p-1 px-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Modify student information"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-student-${student.id}`}
                          onClick={() => {
                            if (confirm(`Withdraw registration of student ${student.fullName}? This cannot be undone.`)) {
                              deleteStudent(student.id);
                            }
                          }}
                          className="p-1 px-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                          title="Filing withdrawal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer actions / pagination control segment */}
        <div id="table-pagination-footer" className="p-4 bg-slate-50/50 dark:bg-slate-850/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>
            Showing {(currentPage - 1) * rowsPerPage + 1}-
            {Math.min(currentPage * rowsPerPage, processedStudents.length)} of{' '}
            {processedStudents.length} entries
          </span>

          <div className="flex items-center gap-1.5">
            <button
              id="pagination-prev"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              id="pagination-next"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
