/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const Toast: React.FC = () => {
  const { toast, clearToast } = useApp();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          id="system-toast-container"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md max-w-sm"
          style={{
            backgroundColor:
              toast.type === 'success'
                ? 'rgba(16, 185, 129, 0.12)'
                : toast.type === 'error'
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(59, 130, 246, 0.12)',
            borderColor:
              toast.type === 'success'
                ? '#10b981'
                : toast.type === 'error'
                ? '#ef4444'
                : '#3b82f6',
          }}
        >
          <div className="flex-shrink-0">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 flex-grow leading-relaxed">
            {toast.message}
          </p>
          <button
            id="toast-close-btn"
            onClick={clearToast}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
