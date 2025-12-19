
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
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{label}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Enrolled</label>
          <input
            type="number"
            min="0"
            value={enrolledValue || ''}
            onChange={(e) => onEnrolledChange(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition-all"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Registration</label>
          <input
            type="number"
            min="0"
            value={registrationValue || ''}
            onChange={(e) => onRegistrationChange(Math.max(0, parseInt(e.target.value) || 0))}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition-all ${
              error ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="0"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
