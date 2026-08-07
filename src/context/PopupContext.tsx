import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface DialogConfig {
  title?: string;
  message: string;
  isConfirm?: boolean;
  resolve?: (value: boolean) => void;
}

interface PopupContextType {
  showToast: (message: string, type?: ToastType) => void;
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const showAlert = useCallback((message: string, title = 'Message'): Promise<void> => {
    return new Promise<void>(resolve => {
      setDialog({
        title,
        message,
        isConfirm: false,
        resolve: () => {
          setDialog(null);
          resolve();
        }
      });
    });
  }, []);

  const showConfirm = useCallback((message: string, title = 'Confirm Action'): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      setDialog({
        title,
        message,
        isConfirm: true,
        resolve: (val: boolean) => {
          setDialog(null);
          resolve(val);
        }
      });
    });
  }, []);

  return (
    <PopupContext.Provider value={{ showToast, showAlert, showConfirm }}>
      {children}

      {/* TOASTS CONTAINER */}
      <div className="fixed top-24 right-4 sm:right-6 md:right-12 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertTriangle : Info;
            const bgClass = toast.type === 'success' 
              ? 'bg-green-50/95 border-green-200 text-green-800' 
              : toast.type === 'error' 
                ? 'bg-red-50/95 border-red-200 text-red-800' 
                : 'bg-warm-light/95 border-warm-dark/15 text-warm-dark';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`p-4 rounded-2xl border backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 pointer-events-auto w-full ${bgClass}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-serif font-semibold leading-normal">{toast.message}</span>
                </div>
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="p-1 hover:opacity-75 transition-opacity cursor-pointer text-current"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* DIALOG MODAL */}
      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (dialog.isConfirm && dialog.resolve) {
                  dialog.resolve(false);
                } else if (dialog.resolve) {
                  dialog.resolve(true);
                }
              }}
              className="absolute inset-0 bg-warm-dark/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[24px] border border-warm-dark/5 shadow-2xl p-6 sm:p-8 max-w-md w-full relative z-10 text-center"
            >
              <h3 className="font-serif font-bold text-2xl text-warm-dark mb-3 italic">
                {dialog.title}
              </h3>
              <p className="text-sm font-serif leading-relaxed text-warm-dark/70 mb-6">
                {dialog.message}
              </p>

              <div className="flex gap-3 justify-center">
                {dialog.isConfirm ? (
                  <>
                    <button
                      onClick={() => dialog.resolve && dialog.resolve(false)}
                      className="px-6 py-3 rounded-xl border border-warm-dark/10 bg-white hover:bg-warm-light/40 text-warm-dark text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer w-28"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => dialog.resolve && dialog.resolve(true)}
                      className="px-6 py-3 rounded-xl bg-warm-accent hover:bg-warm-accent/90 text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer w-28 shadow-sm"
                    >
                      Confirm
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => dialog.resolve && dialog.resolve(true)}
                    className="px-8 py-3 rounded-xl bg-warm-dark hover:bg-warm-accent text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer w-32 shadow-sm"
                  >
                    Okay
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PopupContext.Provider>
  );
};

export const usePopups = () => {
  const context = useContext(PopupContext);
  if (!context) throw new Error('usePopups must be used within a PopupProvider');
  return context;
};
