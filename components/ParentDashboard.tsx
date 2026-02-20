
'use client';

import React, { useState } from 'react';
import { SchoolInfo, UserProfile } from '@/types';
import { linkStudentByCode } from '@/lib/services/databaseService';

interface ParentDashboardProps {
  onLogout: () => void;
  school: SchoolInfo;
  userProfile: UserProfile;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onLogout, school, userProfile }) => {
  const [somaCode, setSomaCode] = useState('');
  const [linkedStudent, setLinkedStudent] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState('');

  const handleLink = async () => {
    if (!somaCode.trim()) return;
    setIsLinking(true);
    setError('');
    const result = await linkStudentByCode(userProfile.id, somaCode);
    if (result.success && result.studentName) {
      setLinkedStudent(result.studentName);
    } else {
      setError("Invalid Soma Code. Please verify with your child's profile.");
    }
    setIsLinking(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col">
      {/* Dynamic Themed Header */}
      <div className="bg-uni-blue text-white p-10 rounded-b-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-crane-yellow rounded-full -mr-24 -mt-24 opacity-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-leaf-green rounded-full -ml-16 -mb-16 opacity-10" />
        
        <div className="flex justify-between items-start mb-8 relative z-10">
           <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20">🏡</div>
           <button onClick={onLogout} className="bg-white/10 hover:bg-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10">Logout</button>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-2xl font-montserrat font-bold">Salama, {userProfile.fullName.split(' ')[0]}!</h1>
          <p className="text-white/60 text-sm mt-1">{school.name} Parent Hub</p>
          
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center space-x-3">
             <div className="w-8 h-8 bg-leaf-green rounded-full flex items-center justify-center text-xs">✓</div>
             <div>
                <p className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Account Status</p>
                <p className="text-xs font-bold">Verified Guardian</p>
             </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 space-y-6 relative z-10 pb-10">
        {/* Child Linking Section */}
        {!linkedStudent ? (
          <div className="bg-white p-8 rounded-[32px] shadow-xl border-2 border-crane-yellow/30 animate-in slide-in-from-bottom-4">
            <h2 className="font-bold text-uni-blue text-lg mb-2">Track Student Progress</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">To view results and syllabus mastery, enter the unique <b>Soma Code</b> shown on your child&apos;s dashboard.</p>
            
            <div className="space-y-4">
              <div className="relative">
                <input 
                  value={somaCode}
                  onChange={e => setSomaCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SOMA-9921" 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono focus:ring-4 focus:ring-uni-blue/10 outline-none transition-all uppercase" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">🔑</span>
              </div>
              <button 
                onClick={handleLink}
                disabled={isLinking || !somaCode}
                className="w-full bg-uni-blue text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-uni-blue/20 disabled:opacity-50 transform active:scale-95 transition-all"
              >
                {isLinking ? 'Verifying Link...' : 'Link Student Profile'}
              </button>
            </div>
            {error && <p className="text-red-500 text-[10px] mt-3 font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}
          </div>
        ) : (
          <div className="bg-leaf-green p-6 rounded-[32px] text-white flex justify-between items-center shadow-xl shadow-leaf-green/20 animate-in zoom-in-95">
             <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🎓</div>
                <div>
                   <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Linked Child</p>
                   <h3 className="font-bold text-xl">{linkedStudent}</h3>
                </div>
             </div>
             <button onClick={() => setLinkedStudent(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </button>
          </div>
        )}

        {/* Detailed Report View */}
        {linkedStudent && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <h2 className="font-bold text-uni-blue text-lg mb-6 flex items-center space-x-2">
                <span>📊</span> <span>Current Mastery Level</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Engagement</p>
                  <p className="text-2xl font-bold text-uni-blue">3h 45m</p>
                  <p className="text-[9px] text-leaf-green font-bold mt-1">↑ 12% from last week</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Avg. Score</p>
                  <p className="text-2xl font-bold text-uni-blue">64%</p>
                  <p className="text-[9px] text-leaf-green font-bold mt-1">Syllabus Target: 80%</p>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-bold text-slate-700">Biology Mastery</span>
                    <span className="font-mono text-uni-blue">65%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-leaf-green h-full w-[65%] rounded-full shadow-sm shadow-leaf-green/30" />
                 </div>

                 <div className="flex justify-between items-center text-sm mb-1 pt-2">
                    <span className="font-bold text-slate-700">Mathematics Mastery</span>
                    <span className="font-mono text-uni-blue">42%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-crane-yellow h-full w-[42%] rounded-full shadow-sm shadow-crane-yellow/30" />
                 </div>
              </div>
            </div>

            <button className="w-full bg-leaf-green text-white font-bold py-5 rounded-[24px] shadow-2xl shadow-leaf-green/20 flex items-center justify-center space-x-3 group hover:scale-[1.02] transition-all">
               <span className="text-2xl group-hover:animate-bounce">🎉</span> 
               <span className="text-sm">Celebrate Progress via WhatsApp</span>
            </button>
            
            <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed px-4">
              Weekly summary reports are sent to your registered WhatsApp number every Saturday at 10:00 AM.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
