
import React, { useState, useEffect, useMemo } from 'react';
import { SchoolInfo, ClassData, EnrollmentPayload } from './types';
import { fetchSchoolInfo, submitEnrollmentData } from './services/gasService';
import { InputGroup } from './components/InputGroup';

const App: React.FC = () => {
  const [udiseCode, setUdiseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [class6, setClass6] = useState<ClassData>({ enrolled: 0, registration: 0 });
  const [class7, setClass7] = useState<ClassData>({ enrolled: 0, registration: 0 });
  const [class8, setClass8] = useState<ClassData>({ enrolled: 0, registration: 0 });

  const totals = useMemo(() => {
    const totalEnrolled = class6.enrolled + class7.enrolled + class8.enrolled;
    const totalRegistration = class6.registration + class7.registration + class8.registration;
    const percentage = totalEnrolled > 0 ? ((totalRegistration / totalEnrolled) * 100).toFixed(2) : '0.00';
    return { totalEnrolled, totalRegistration, percentage };
  }, [class6, class7, class8]);

  const errors = {
    class6: class6.registration > class6.enrolled ? 'Registration cannot exceed Enrolled' : null,
    class7: class7.registration > class7.enrolled ? 'Registration cannot exceed Enrolled' : null,
    class8: class8.registration > class8.enrolled ? 'Registration cannot exceed Enrolled' : null,
  };

  const hasErrors = !!(errors.class6 || errors.class7 || errors.class8);

  const handleUdiseSearch = async () => {
    if (!udiseCode || udiseCode.length < 5) return;
    setLoading(true);
    setMessage(null);
    const response = await fetchSchoolInfo(udiseCode);
    setLoading(false);
    if (response.success && response.data) {
      setSchool(response.data);
    } else {
      setSchool(null);
      setMessage({ type: 'error', text: response.error || 'School not found' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || hasErrors) return;

    setSubmitting(true);
    const payload: EnrollmentPayload = {
      udiseCode: school.udiseCode,
      schoolName: school.schoolName,
      nyayPanchayat: school.nyayPanchayat,
      schoolType: school.schoolType,
      class6,
      class7,
      class8,
      totalEnrolled: totals.totalEnrolled,
      totalRegistration: totals.totalRegistration,
      registrationPercentage: `${totals.percentage}%`
    };

    const response = await submitEnrollmentData(payload);
    setSubmitting(false);

    if (response.success) {
      setMessage({ type: 'success', text: 'Data saved successfully!' });
      // Reset form
      setUdiseCode('');
      setSchool(null);
      setClass6({ enrolled: 0, registration: 0 });
      setClass7({ enrolled: 0, registration: 0 });
      setClass8({ enrolled: 0, registration: 0 });
    } else {
      setMessage({ type: 'error', text: response.error || 'Failed to save data' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            School Enrollment Portal
          </h1>
          <p className="text-lg text-gray-500">
            Enter UDISE Code to manage registration data
          </p>
        </div>

        {/* UDISE Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="udise" className="block text-sm font-medium text-gray-700 mb-1">
                  UDISE Code
                </label>
                <input
                  id="udise"
                  type="text"
                  value={udiseCode}
                  onChange={(e) => setUdiseCode(e.target.value)}
                  placeholder="Enter 11-digit UDISE Code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleUdiseSearch}
                  disabled={loading || !udiseCode}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-100 flex items-center justify-center"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Fetch Details'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          } animate-fade-in`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 font-medium">{message.text}</div>
            </div>
          </div>
        )}

        {/* School Details Card & Form */}
        {school && (
          <div className="animate-slide-up space-y-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">School Name</p>
                  <p className="text-xl font-bold">{school.schoolName}</p>
                </div>
                <div>
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Nyay Panchayat</p>
                  <p className="text-xl font-bold">{school.nyayPanchayat}</p>
                </div>
                <div>
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">UDISE Code</p>
                  <p className="text-lg font-mono">{school.udiseCode}</p>
                </div>
                <div>
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">School Type</p>
                  <p className="text-lg font-bold">{school.schoolType}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup
                  label="Class 6"
                  enrolledValue={class6.enrolled}
                  registrationValue={class6.registration}
                  onEnrolledChange={(v) => setClass6(p => ({ ...p, enrolled: v }))}
                  onRegistrationChange={(v) => setClass6(p => ({ ...p, registration: v }))}
                  error={errors.class6 || undefined}
                />
                <InputGroup
                  label="Class 7"
                  enrolledValue={class7.enrolled}
                  registrationValue={class7.registration}
                  onEnrolledChange={(v) => setClass7(p => ({ ...p, enrolled: v }))}
                  onRegistrationChange={(v) => setClass7(p => ({ ...p, registration: v }))}
                  error={errors.class7 || undefined}
                />
                <InputGroup
                  label="Class 8"
                  enrolledValue={class8.enrolled}
                  registrationValue={class8.registration}
                  onEnrolledChange={(v) => setClass8(p => ({ ...p, enrolled: v }))}
                  onRegistrationChange={(v) => setClass8(p => ({ ...p, registration: v }))}
                  error={errors.class8 || undefined}
                />
              </div>

              {/* Summary Section */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 uppercase">Total Enrolled</p>
                    <p className="text-2xl font-black text-gray-800">{totals.totalEnrolled}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 uppercase">Total Registration</p>
                    <p className="text-2xl font-black text-gray-800">{totals.totalRegistration}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 uppercase">Percentage</p>
                    <p className="text-2xl font-black text-indigo-600">{totals.percentage}%</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || hasErrors}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
              >
                {submitting ? (
                   <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                ) : 'Submit Enrollment Data'}
              </button>
            </form>
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
