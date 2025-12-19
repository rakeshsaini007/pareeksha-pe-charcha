
import React, { useState, useMemo } from 'react';
import { SchoolInfo, ClassData, EnrollmentPayload } from './types';
import { fetchSchoolInfo, submitEnrollmentData } from './services/gasService';
import { InputGroup } from './components/InputGroup';
import { Toast } from './components/Toast';

const App: React.FC = () => {
  const [udiseCode, setUdiseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
    class6: class6.registration > class6.enrolled ? 'Must be ≤ enrolled' : null,
    class7: class7.registration > class7.enrolled ? 'Must be ≤ enrolled' : null,
    class8: class8.registration > class8.enrolled ? 'Must be ≤ enrolled' : null,
  };

  const hasErrors = !!(errors.class6 || errors.class7 || errors.class8);

  const handleUdiseSearch = async () => {
    if (!udiseCode || udiseCode.length < 5) return;
    setLoading(true);
    setToast(null);
    
    const response = await fetchSchoolInfo(udiseCode);
    setLoading(false);
    
    if (response.success && response.data) {
      setSchool(response.data);
      if (response.data.existingData) {
        setClass6(response.data.existingData.class6);
        setClass7(response.data.existingData.class7);
        setClass8(response.data.existingData.class8);
        setIsUpdate(true);
        setToast({ type: 'success', text: 'Existing data found and loaded!' });
      } else {
        setClass6({ enrolled: 0, registration: 0 });
        setClass7({ enrolled: 0, registration: 0 });
        setClass8({ enrolled: 0, registration: 0 });
        setIsUpdate(false);
      }
    } else {
      setSchool(null);
      setToast({ type: 'error', text: response.error || 'School not found' });
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
      const successMsg = isUpdate ? 'Data updated successfully!' : 'Data saved successfully!';
      setToast({ type: 'success', text: successMsg });
      // Reset
      setTimeout(() => {
        setUdiseCode('');
        setSchool(null);
      }, 1000);
    } else {
      setToast({ type: 'error', text: response.error || 'Failed to save data' });
    }
  };

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Hero Header */}
        <header className="text-center space-y-4 animate-fade-in">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-2 shadow-sm">
            Government Portal
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-6xl drop-shadow-sm">
            परीक्षा पर चर्चा <span className="text-indigo-600">2026</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">
            Ensuring every student is part of the dialogue. Manage school enrollment and registration data seamlessly.
          </p>
        </header>

        {/* Search Engine Section */}
        <section className="glass-panel p-2 rounded-[2.5rem] premium-shadow border border-white/60">
          <div className="p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-[2rem] bg-white shadow-inner">
              <div className="flex-grow flex items-center px-6 py-2">
                <span className="text-slate-400 mr-4">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </span>
                <input
                  id="udise"
                  type="text"
                  value={udiseCode}
                  onChange={(e) => setUdiseCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUdiseSearch()}
                  placeholder="Enter 11-digit UDISE Code..."
                  className="w-full h-12 bg-transparent text-slate-800 font-semibold placeholder:text-slate-300 outline-none text-lg"
                />
              </div>
              <button
                onClick={handleUdiseSearch}
                disabled={loading || !udiseCode}
                className="group relative h-14 w-full sm:w-auto px-10 bg-indigo-600 text-white font-bold rounded-[1.5rem] hover:bg-indigo-700 active:scale-95 transition-all duration-300 disabled:opacity-50 overflow-hidden shadow-xl shadow-indigo-200"
              >
                <div className="flex items-center justify-center gap-3">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white loader rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Fetch Data</span>
                      <svg className="group-hover:translate-x-1 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        {school && (
          <div className="animate-slide-up space-y-8 pb-12">
            {/* School Profile Glass Card */}
            <div className="relative overflow-hidden glass-panel rounded-[3rem] p-10 premium-shadow">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
              
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {school.schoolType}
                      </div>
                      {isUpdate && (
                        <div className="px-3 py-1 bg-amber-400 text-amber-900 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          Existing Record
                        </div>
                      )}
                   </div>
                   <div>
                      <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight uppercase">
                        {school.schoolName}
                      </h2>
                      <p className="text-indigo-500 font-bold tracking-[0.2em] mt-2 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {school.nyayPanchayat}
                      </p>
                   </div>
                </div>

                <div className="bg-slate-900/5 px-8 py-6 rounded-[2rem] border border-slate-200/30">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">UDISE Identification</div>
                  <div className="text-3xl font-mono font-bold text-slate-800 tracking-tighter">
                    {school.udiseCode}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Input Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup
                  label="Class 06"
                  enrolledValue={class6.enrolled}
                  registrationValue={class6.registration}
                  onEnrolledChange={(v) => setClass6(p => ({ ...p, enrolled: v }))}
                  onRegistrationChange={(v) => setClass6(p => ({ ...p, registration: v }))}
                  error={errors.class6 || undefined}
                />
                <InputGroup
                  label="Class 07"
                  enrolledValue={class7.enrolled}
                  registrationValue={class7.registration}
                  onEnrolledChange={(v) => setClass7(p => ({ ...p, enrolled: v }))}
                  onRegistrationChange={(v) => setClass7(p => ({ ...p, registration: v }))}
                  error={errors.class7 || undefined}
                />
                <InputGroup
                  label="Class 08"
                  enrolledValue={class8.enrolled}
                  registrationValue={class8.registration}
                  onEnrolledChange={(v) => setClass8(p => ({ ...p, enrolled: v }))}
                  onRegistrationChange={(v) => setClass8(p => ({ ...p, registration: v }))}
                  error={errors.class8 || undefined}
                />
              </div>

              {/* Analytics Summary */}
              <div className="glass-panel p-10 rounded-[3rem] border border-white/40 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
                   <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                  <div className="text-center sm:text-left sm:pr-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Enrollment</p>
                    <p className="text-5xl font-black text-slate-800 tracking-tighter">{totals.totalEnrolled}</p>
                  </div>
                  <div className="text-center sm:text-left sm:px-8 pt-6 sm:pt-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registration Goal</p>
                    <p className="text-5xl font-black text-slate-800 tracking-tighter">{totals.totalRegistration}</p>
                  </div>
                  <div className="text-center sm:text-left sm:pl-8 pt-6 sm:pt-0">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Progress Index</p>
                    <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                      <p className="text-5xl font-black text-indigo-600 tracking-tighter">{totals.percentage}</p>
                      <span className="text-2xl font-bold text-indigo-400">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={submitting || hasErrors}
                className={`group relative w-full h-20 rounded-[1.5rem] font-black text-xl transition-all duration-500 flex items-center justify-center gap-4 overflow-hidden shadow-2xl disabled:opacity-50 disabled:grayscale ${
                  isUpdate 
                    ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                }`}
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {submitting ? (
                   <div className="w-6 h-6 border-2 border-white loader rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="relative z-10">{isUpdate ? 'UPDATE RECORD' : 'CONFIRM SUBMISSION'}</span>
                    <svg className="group-hover:translate-x-2 transition-transform duration-300 relative z-10" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
      
      <style>{`
        .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default App;
