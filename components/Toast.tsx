
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-rose-500';
  const icon = type === 'success' ? '✓' : '✕';

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-up">
      <div className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 min-w-[300px]`}>
        <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold">
          {icon}
        </div>
        <div className="flex-grow font-medium">{message}</div>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          ✕
        </button>
      </div>
    </div>
  );
};
