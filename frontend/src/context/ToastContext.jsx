import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { id, message, type } = toast;

  const bgStyles = {
    success: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    error: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/20 text-rose-700 dark:text-rose-400',
    warning: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20 text-amber-700 dark:text-amber-400',
    info: 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20 text-blue-700 dark:text-blue-400',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500 dark:text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 dark:text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 dark:text-amber-400" />,
    info: <Info className="w-5 h-5 shrink-0 text-blue-500 dark:text-blue-400" />,
  };

  return (
    <div
      className={`flex items-start justify-between gap-3 p-4 rounded-2xl border backdrop-blur-xl pointer-events-auto shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in ${bgStyles[type] || bgStyles.info}`}
    >
      <div className="flex gap-2.5">
        {icons[type]}
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
