/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentModalProps {
  student: Student | null; // Null means Add Student, otherwise Edit Student
  onClose: () => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ student, onClose }) => {
  const { addStudent, updateStudent } = useApp();

  const isEditMode = !!student;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [course, setCourse] = useState('Computer Science');
  const [department, setDepartment] = useState('Engineering');
  const [semester, setSemester] = useState('1st');
  const [attendance, setAttendance] = useState(85);
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2004-01-01');
  const [profileImage, setProfileImage] = useState('');

  const [dragActive, setDragActive] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Prepopulate form if in edit mode
  useEffect(() => {
    if (student) {
      setFullName(student.fullName);
      setRollNumber(student.rollNumber);
      setEmail(student.email);
      setPhoneNumber(student.phoneNumber);
      setCourse(student.course);
      setDepartment(student.department);
      setSemester(student.semester);
      setAttendance(student.attendance);
      setAddress(student.address);
      setDateOfBirth(student.dateOfBirth);
      setProfileImage(student.profileImage || '');
    } else {
      // Defaults for added student
      setFullName('');
      setRollNumber(`REG-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(100 + Math.random() * 900)}`);
      setEmail('');
      setPhoneNumber('');
      setCourse('Computer Science');
      setDepartment('Engineering');
      setSemester('1st');
      setAttendance(90);
      setAddress('');
      setDateOfBirth('2005-01-01');
      setProfileImage('');
    }
  }, [student]);

  // Standard departments/courses listing
  const departmentsList = ['Engineering', 'Computer Science', 'Sciences', 'Humanities', 'Medical', 'Business'];
  const coursesList = [
    'Computer Science',
    'Data Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Biotechnology',
    'Physics',
    'Philosophy',
    'Administration',
    'Microbiology'
  ];
  const semestersList = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  // Input sanitization and validations
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full name is active registration requirement.';
    }

    if (!rollNumber.trim()) {
      errors.rollNumber = 'Unique roll identifier code needed.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      errors.email = 'Valid academic or personal email required.';
    }

    if (attendance < 0 || attendance > 100) {
      errors.attendance = 'Attendance percentage must fall inside 0-100.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Convert uploaded image file to lightweight Base64 string for embedded database persistence
  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      fullName,
      rollNumber,
      email,
      phoneNumber,
      course,
      department,
      semester,
      attendance: Number(attendance),
      address,
      dateOfBirth,
      profileImage
    };

    let success = false;
    if (isEditMode && student) {
      success = await updateStudent(student.id, payload);
    } else {
      success = await addStudent(payload);
    }

    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div id="modal-portal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Modal sheet card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
              {isEditMode ? 'Modify Student Information' : 'Register New Student Profile'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {isEditMode ? 'Updates are logged to live timeline history.' : 'Register records inside system models.'}
            </p>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1 px-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-450 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow">
          {/* Section 1: Avatar Profile image selection drag and drop */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50/50 dark:bg-slate-850/20 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="relative shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-850 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-3xl">
                  {fullName ? fullName.slice(0, 2).toUpperCase() : '?'}
                </div>
              )}
              {profileImage && (
                <button
                  type="button"
                  id="remove-avatar-btn"
                  onClick={() => setProfileImage('')}
                  className="absolute -bottom-1 -right-1 p-1 bg-red-500 hover:bg-red-650 text-white rounded-full shadow-lg border border-white dark:border-slate-900 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Drag Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-grow h-24 border border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer p-4 transition-all ${
                dragActive
                  ? 'border-violet-500 bg-violet-500/5'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-100/30'
              }`}
            >
              <input
                ref={fileInputRef}
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Drag and drop image, or <span className="text-violet-500">browse file</span>
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Supports PNG, JPG, or WEBP. Max 2MB limit.</p>
            </div>
          </div>

          {/* Form grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full name input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Full Name *</label>
              <input
                id="form-full-name"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className={`w-full p-2.5 bg-slate-50 dark:bg-slate-850 border rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 ${
                  formErrors.fullName ? 'border-red-400' : 'border-slate-200 dark:border-slate-800 focus:border-violet-500'
                }`}
                placeholder="Jane Doe"
              />
              {formErrors.fullName && <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.fullName}</p>}
            </div>

            {/* Roll number input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Roll Number *</label>
              <input
                id="form-roll-number"
                type="text"
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
                className={`w-full p-2.5 bg-slate-50 dark:bg-slate-850 border rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 ${
                  formErrors.rollNumber ? 'border-red-400' : 'border-slate-200 dark:border-slate-800 focus:border-violet-500'
                }`}
                placeholder="CS-2026-042"
              />
              {formErrors.rollNumber && <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.rollNumber}</p>}
            </div>

            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Academic Email *</label>
              <input
                id="form-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full p-2.5 bg-slate-50 dark:bg-slate-850 border rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 ${
                  formErrors.email ? 'border-red-400' : 'border-slate-200 dark:border-slate-800 focus:border-violet-500'
                }`}
                placeholder="jane.doe@university.edu"
              />
              {formErrors.email && <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.email}</p>}
            </div>

            {/* Phone number input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Phone Number</label>
              <input
                id="form-phone-number"
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none"
                placeholder="+1 (555) 234-5678"
              />
            </div>

            {/* Department input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Department</label>
              <select
                id="form-department"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              >
                {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Course Program input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Program Course</label>
              <select
                id="form-course"
                value={course}
                onChange={e => setCourse(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              >
                {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Semester selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Semester</label>
              <select
                id="form-semester"
                value={semester}
                onChange={e => setSemester(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              >
                {semestersList.map(s => <option key={s} value={s}>{s} Semester</option>)}
              </select>
            </div>

            {/* Attendance Percentage progress slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center bg-slate-100/10 rounded-sm">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Attendance Ratio</label>
                <span className="text-xs font-mono font-bold text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded">{attendance}%</span>
              </div>
              <input
                id="form-attendance-slider"
                type="range"
                min="0"
                max="100"
                value={attendance}
                onChange={e => setAttendance(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-650"
              />
            </div>

            {/* Date Of Birth selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Date of Birth</label>
              <input
                id="form-dob"
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Home Address</label>
              <textarea
                id="form-address"
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none resize-none"
                placeholder="Street address city postal country"
              />
            </div>
          </div>

          {/* Form Actions bottom panel */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              id="cancel-form-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-form-btn"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isEditMode ? 'Update Record' : 'Register Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
