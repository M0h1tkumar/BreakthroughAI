import { useState, useEffect } from 'react';
import { Toast, ToastService } from './ui/toast-notification';

export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: string; props: any }>>([]);

  useEffect(() => {
    const unsubscribe = ToastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast.props}
          onClose={() => ToastService.remove(toast.id)}
        />
      ))}
    </div>
  );
}