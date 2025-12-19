
import React from 'react';

interface InputGroupProps {
  label: string;
  enrolledValue: number;
  registrationValue: number;
  onEnrolledChange: (val: number) => void;
  onRegistrationChange: (val: number) => void;
  error?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  enrolledValue,
  registrationValue,
  onEnrolledChange,
  onRegistrationChange,
  error
}) => {
  return (
    <div className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">{label}</h3>
        <div className={`w-2 h-2 rounded-full ${error ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Enrolled Students</label>
          <input
            type="number"
            min="0"
            value={enrolledValue || ''}
            onChange={(e) => onEnrolledChange(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 font-semibold outline-none transition-all"
            placeholder="0"
          />
        </div>
        
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Registration Done</label>
          <input
            type="number"
            min="0"
            value={registrationValue || ''}
            onChange={(e) => onRegistrationChange(Math.max(0, parseInt(e.target.value) || 0))}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-4 text-slate-700 font-semibold outline-none transition-all ${
              error 
                ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500/10 focus:border-rose-500' 
                : 'border-slate-200 bg-slate-50/50 focus:ring-indigo-500/10 focus:border-indigo-500'
            }`}
            placeholder="0"
          />
        </div>
      </div>
      
      {error && (
        <div className="mt-3 text-[10px] text-rose-600 font-bold bg-rose-50 py-1 px-3 rounded-full flex items-center gap-2">
          <span className="text-lg leading-none">⚠</span> {error}
        </div>
      )}
    </div>
  );
};
