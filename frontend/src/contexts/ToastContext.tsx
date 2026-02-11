/**
 * Custom toast system using Alert component.
 *
 * Provides toast-like notifications that auto-dismiss after a few seconds.
 * Positioned at bottom-left of the screen.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Toast {
  id: string;
  variant: 'default' | 'destructive';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  loading: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const duration = toast.duration || 3000;

    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  };

  const success = (title: string, description?: string) => {
    showToast({ variant: 'default', title, description });
  };

  const error = (title: string, description?: string) => {
    showToast({ variant: 'destructive', title, description });
  };

  const info = (title: string, description?: string) => {
    showToast({ variant: 'default', title, description });
  };

  const loading = (title: string, description?: string) => {
    return showToast({ variant: 'default', title, description, duration: 10000 });
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (variant: Toast['variant']) => {
    if (variant === 'destructive') {
      return <XCircle className="h-4 w-4" />;
    }
    return <CheckCircle2 className="h-4 w-4" />;
  };

  const getToastClasses = (variant: Toast['variant']) => {
    if (variant === 'destructive') {
      return 'bg-rose-50 border-rose-400 text-rose-800 [&>svg]:text-rose-600';
    }
    return 'bg-emerald-50 border-emerald-400 text-emerald-900 [&>svg]:text-emerald-600';
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, loading, dismiss }}>
      {children}

      {/* Toast Container - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-50 flex w-full max-w-md flex-col gap-2">
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            variant={toast.variant}
            className={`animate-in slide-in-from-left-5 fade-in ${getToastClasses(toast.variant)}`}
          >
            {getIcon(toast.variant)}
            <AlertTitle>{toast.title}</AlertTitle>
            {toast.description && <AlertDescription>{toast.description}</AlertDescription>}
          </Alert>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
