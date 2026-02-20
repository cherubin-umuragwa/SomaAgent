
'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ChatAgent from './ChatAgent';
import MasteryMap from './MasteryMap';
import ChallengeModal from './ChallengeModal';
import { Resource, SchoolInfo, UserProfile, TeacherFeedback, Exam } from '@/types';
import { fetchClassResources, fetchStudentFeedback, fetchUpcomingExams } from '@/lib/services/databaseService';

interface Props {
  onLogout: () => void;
  resources: Resource[];
  school: SchoolInfo;
  userProfile: UserProfile;
}

const StudentDashboard: React.FC<Props> = ({ onLogout, resources: initialResources, school, userProfile }) => {
  const [activeTab, setActiveTab] = useState<'map' | 'resources' | 'corner'>('map');
  const [liveResources, setLiveResources] = useState<Resource[]>(initialResources);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeTopic, setChallengeTopic] = useState('');
  
  const [feedback, setFeedback] = useState<TeacherFeedback[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const dbResources = await fetchClassResources(school.name);
      setLiveResources(dbResources);
      const fb = await fetchStudentFeedback(userProfile.id);
      setFeedback(fb);
      const ex = await fetchUpcomingExams();
      setExams(ex);
    };
    loadData();
  }, [school.name, userProfile.id]);

  const handleTriggerChallenge = (topic: string) => {
    setChallengeTopic(topic);
    setShowChallenge(true);
  };

  const navItems = [
    { id: 'map', label: 'My Syllabus', icon: '🗺️' },
    { id: 'resources', label: 'E-Library', icon: '📚' },
    { id: 'corner', label: 'Academic Help', icon: '👩‍🏫' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar - Refined with better spacing */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-72 bg-uni-blue text-white p-8 z-30 shadow-2xl overflow-y-auto">
        <div className="flex items-center space-x-4 mb-16 px-2">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-uni-blue font-black text-2xl shadow-xl transform -rotate-3">S</div>
          <div>
            <h1 className="text-xl font-montserrat font-black tracking-tight uppercase leading-none">Soma Hub</h1>
            <p className="text-[10px] text-crane-yellow font-bold uppercase tracking-[0.2em] mt-1">Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)} 
              className={`w-full flex items-center space-x-4 p-5 rounded-2xl transition-all duration-300 border-2 ${activeTab === item.id ? 'bg-white/15 border-crane-yellow text-crane-yellow shadow-lg scale-105' : 'border-transparent hover:bg-white/5 text-slate-300'}`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-auto bg-white/10 p-6 rounded-[28px] border border-white/20 mb-8 backdrop-blur-sm">
          <p className="text-xs uppercase font-black text-crane-yellow mb-3 opacity-80 tracking-widest">Soma Identity Code</p>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <p className="text-xl font-mono font-black text-center tracking-wider">{userProfile.studentCode}</p>
          </div>
        </div>

        <button onClick={onLogout} className="flex items-center justify-center space-x-3 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-2xl transition-all font-black text-xs uppercase tracking-widest">
           <span>🚪</span><span>Logout Session</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation - Higher visual clarity */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-100 flex justify-around items-center px-2 py-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[32px]">
        {navItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center flex-1 transition-all ${activeTab === item.id ? 'text-uni-blue' : 'text-slate-400'}`}
          >
            <span className={`text-2xl transition-transform ${activeTab === item.id ? 'scale-125 -translate-y-1' : ''}`}>{item.icon}</span>
            <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
            {activeTab === item.id && <div className="w-1 h-1 bg-uni-blue rounded-full mt-1" />}
          </button>
        ))}
        <button onClick={onLogout} className="flex flex-col items-center flex-1 text-red-400">
          <span className="text-2xl">🚪</span>
          <span className="text-[9px] font-black uppercase mt-1 opacity-60">Exit</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 pb-32 md:pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header - Improved Hierarchy */}
          <div className="mb-10 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-uni-blue/10 text-uni-blue rounded-full text-[10px] font-black uppercase tracking-widest">Institutional Hub</span>
                <span className="w-2 h-2 bg-leaf-green rounded-full animate-pulse shadow-sm shadow-leaf-green" />
              </div>
              <h1 className="text-4xl md:text-5xl font-montserrat font-black text-uni-blue leading-tight tracking-tight">
                Salama, {userProfile.fullName.split(' ')[0]}!
              </h1>
              <p className="text-slate-500 font-bold text-base md:text-lg mt-2 flex items-center gap-2">
                <span className="text-slate-300">Senior 4 •</span> {school.name}
              </p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="hidden lg:flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-2xl">🏆</div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Rank</p>
                   <p className="font-black text-slate-800 text-xs">Top 15%</p>
                </div>
              </div>
              <div className="bg-leaf-green text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-leaf-green/20">
                Verified Profile
              </div>
            </div>
          </div>

          {activeTab === 'map' && (
            <div className="space-y-10 md:space-y-14 animate-in fade-in duration-500">
              {/* Quick Mastery Cards - Better contrast and grouping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[ 
                  {name: 'Biology', val: 65, col: '#4CAF50', status: 'On Track'}, 
                  {name: 'Math', val: 42, col: '#FCDC04', status: 'Action Needed'} 
                ].map((subject) => (
                  <div key={subject.name} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center space-x-6 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-20 h-20 transform group-hover:rotate-6 transition-transform">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{ value: subject.val }, { value: 100 - subject.val }]} innerRadius={28} outerRadius={38} dataKey="value" startAngle={90} endAngle={-270}>
                            <Cell fill={subject.col} stroke="none" /><Cell fill="#f8fafc" stroke="none" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{subject.name}</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-4xl font-black text-uni-blue">{subject.val}%</p>
                        <span className="text-[10px] text-slate-300 font-bold uppercase">Mastery</span>
                      </div>
                      <p className={`text-[9px] font-black uppercase mt-2 px-2 py-0.5 rounded-full inline-block ${subject.status === 'On Track' ? 'bg-leaf-green/10 text-leaf-green' : 'bg-red-50 text-red-500'}`}>
                        {subject.status}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Stats Summary Card */}
                <div className="bg-uni-blue text-white p-8 rounded-[40px] shadow-xl shadow-uni-blue/20 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Active Study Time</h4>
                  <div className="my-2">
                    <p className="text-4xl font-black tracking-tighter">12.5 <span className="text-lg font-bold opacity-60">hrs</span></p>
                    <p className="text-[10px] font-bold text-crane-yellow uppercase tracking-widest mt-1">This Week's Goal: 15h</p>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-4">
                    <div className="bg-crane-yellow h-full w-[83%] rounded-full shadow-[0_0_8px_rgba(252,220,4,0.5)]" />
                  </div>
                </div>
              </div>

              {/* Main Mastery Map Section */}
              <div className="bg-white p-8 md:p-12 rounded-[48px] shadow-sm border border-slate-100">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                   <div>
                     <h2 className="text-2xl md:text-3xl font-black text-uni-blue tracking-tight">O-Level Syllabus Progression</h2>
                     <p className="text-slate-500 text-sm font-medium mt-1">Track your journey through the NCDC curriculum units.</p>
                   </div>
                   <button onClick={() => handleTriggerChallenge('General Science')} className="w-full lg:w-auto bg-crane-yellow text-uni-blue px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-crane-yellow/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                     <span className="text-xl">⚡</span> Launch AI Daily Drill
                   </button>
                </div>
                <MasteryMap />
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                 <div>
                   <h2 className="text-3xl font-black text-uni-blue tracking-tight">Academic Library</h2>
                   <p className="text-slate-500 font-medium text-base mt-1">Specialized notes and interactive quizzes from your teachers.</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <input type="text" placeholder="Search resources..." className="bg-white border border-slate-200 px-5 py-3 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-uni-blue/10 min-w-[240px]" />
                 </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {liveResources.map(res => (
                    <div key={res.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col group hover:shadow-2xl hover:border-uni-blue transition-all duration-300 overflow-hidden">
                      <div className="p-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center text-4xl mb-8 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">📖</div>
                        <h3 className="font-black text-slate-800 text-xl md:text-2xl mb-2 group-hover:text-uni-blue transition-colors">{res.title}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-leaf-green rounded-full" /> {res.subject} • {res.unit}
                        </p>
                      </div>
                      <div className="mt-auto px-8 pb-8">
                        <button onClick={() => handleTriggerChallenge(res.title)} className="w-full py-5 bg-slate-50 text-uni-blue font-black rounded-[24px] text-xs uppercase tracking-[0.15em] hover:bg-uni-blue hover:text-white transition-all shadow-lg shadow-slate-200 group-hover:shadow-uni-blue/20">
                          Take Mastery Quiz
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty State / Add more if needed */}
                  <div className="bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                    <p className="text-4xl mb-4">📚</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">More Resources Pending Upload</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'corner' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black text-uni-blue tracking-tight">Academic Guidance</h2>
                    <p className="text-slate-500 font-medium text-base mt-1">Direct feedback and personalized advice from your specialist teachers.</p>
                  </div>
                  
                  {feedback.length === 0 ? (
                    <div className="bg-white p-16 rounded-[48px] text-center border-2 border-dashed border-slate-100">
                      <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Awaiting feedback from staff...</p>
                    </div>
                  ) : (
                    feedback.map(f => (
                      <div key={f.id} className="bg-white p-8 md:p-10 rounded-[40px] border-l-[12px] border-leaf-green shadow-sm shadow-leaf-green/10 flex items-start space-x-6 md:space-x-8 group hover:shadow-xl transition-all">
                         <div className="text-5xl shrink-0 group-hover:scale-110 transition-transform">👩‍🏫</div>
                         <div>
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-xs font-black text-leaf-green uppercase tracking-widest">{f.fromTeacher}</p>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] bg-leaf-green/10 text-leaf-green px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{f.subject}</span>
                            </div>
                            <p className="text-slate-800 text-base md:text-xl font-bold leading-relaxed">{f.message}</p>
                            <div className="flex items-center gap-4 mt-6">
                              <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Received: {f.date}</p>
                              <button className="text-[10px] text-uni-blue font-black uppercase hover:underline">Acknowledge Guidance</button>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>

               <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black text-uni-blue tracking-tight">Upcoming Assessments</h2>
                    <p className="text-slate-500 font-medium text-base mt-1">High-stakes termly exams and specialized unit tests.</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {exams.map(e => (
                       <div key={e.id} className="bg-uni-blue p-10 rounded-[48px] text-white shadow-2xl shadow-uni-blue/30 flex flex-col justify-between min-h-[240px] relative overflow-hidden group">
                          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                              <span className="bg-crane-yellow text-uni-blue px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{e.subject}</span>
                              <span className="text-xs font-black text-white/40 uppercase tracking-widest">Official Assessment</span>
                            </div>
                            <h4 className="text-3xl md:text-4xl font-black mb-3 leading-tight">{e.title}</h4>
                            <p className="text-sm md:text-base text-white/50 mb-8 font-medium">Prepared by school course directors.</p>
                          </div>
                          <div className="flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80 pt-6 border-t border-white/10 relative z-10">
                             <span className="flex items-center gap-2">📅 {e.date.split('T')[0]}</span>
                             <span className="flex items-center gap-2">⌛ Duration: {e.duration}</span>
                          </div>
                       </div>
                     ))}
                     
                     {exams.length === 1 && (
                       <div className="bg-slate-100 rounded-[48px] border-2 border-dashed border-slate-200 flex items-center justify-center p-12 text-center">
                          <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No other assessments scheduled for this week</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      <ChatAgent schoolName={school.name} />
      {showChallenge && <ChallengeModal topic={challengeTopic} resources={liveResources} onClose={() => setShowChallenge(false)} />}
    </div>
  );
};

export default StudentDashboard;
