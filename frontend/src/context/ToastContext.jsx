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
    success: 'bg-gold/10 dark:bg-gold/15 border-gold/20 text-gold-700 dark:text-gold-400',
    error: 'bg-brand-500/10 dark:bg-brand-500/15 border-brand-500/20 text-brand-700 dark:text-brand-400',
    warning: 'bg-gold/10 dark:bg-gold/15 border-gold/20 text-gold-700 dark:text-gold-400',
    info: 'bg-brand-600/10 dark:bg-brand-600/15 border-brand-600/20 text-brand-600 dark:text-brand-400',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 shrink-0 text-gold" />,
    error: <AlertCircle className="w-5 h-5 shrink-0 text-brand-500" />,
    warning: <AlertTriangle className="w-5 h-5 shrink-0 text-gold" />,
    info: <Info className="w-5 h-5 shrink-0 text-brand-600" />,
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
