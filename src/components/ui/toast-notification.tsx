import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-md",
      bgColors[type]
    )}>
      {icons[type]}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

class ToastService {
  private static toasts: Array<{ id: string; props: Omit<ToastProps, 'onClose'> }> = [];
  private static listeners: Array<(toasts: typeof ToastService.toasts) => void> = [];

  static show(message: string, type: ToastProps['type'] = 'info', duration?: number) {
    const id = Date.now().toString();
    this.toasts.push({ id, props: { message, type, duration } });
    this.notifyListeners();

    setTimeout(() => {
      this.remove(id);
    }, duration || 5000);
  }

  static remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  static subscribe(listener: (toasts: typeof ToastService.toasts) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

export { ToastService };