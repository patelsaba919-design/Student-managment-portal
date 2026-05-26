/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, Eye, EyeOff, BookOpen, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLogin: React.FC = () => {
  const { login, isLoading } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !password.trim()) {
      setFormError('Please input both credentials fields.');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setFormError('Invalid username or password.');
    }
  };

  return (
    <div id="login-container" className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black relative overflow-hidden p-4">
      {/* Dynamic Background Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[130px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-600/10 blur-[130px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div id="login-card" className="w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-4">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans text-center">
              Student Management System
            </h1>
            <p className="text-slate-400 text-xs mt-1 text-center font-sans">
              Enter credentials to access the administrative dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-xs text-red-400 text-center"
              >
                {formError}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-200"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Administrator Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-200"
                  placeholder="Password"
                />
                <button
                  id="toggle-pass-visibility-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              id="login-submit-btn"
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-6"
            >
              {isLoading ? (
                <div id="login-spinner" className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In Securely
                </>
              )}
            </motion.button>
          </form>

          {/* Quick tester credentials box */}
          <div id="demo-credentials-box" className="mt-8 bg-slate-950/30 border border-slate-800/40 p-4 rounded-2xl flex flex-col items-center">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              💻 Tester Access Credentials
            </span>
            <div className="grid grid-cols-2 gap-x-4 text-xs">
              <p className="text-slate-400 text-right font-medium">Username:</p>
              <p className="text-white font-mono font-semibold">admin</p>
              <p className="text-slate-400 text-right font-medium">Password:</p>
              <p className="text-white font-mono font-semibold">admin123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
