
'use client';

import React, { useState, useEffect } from 'react';
import { SchoolInfo, UserProfile, SchoolClass } from '@/types';
import { 
  fetchPendingStudents, 
  updateStudentStatus, 
  fetchSchoolClasses, 
  createSchoolClass, 
  fetchTeachers,
  assignCourseToTeacher 
} from '@/lib/services/databaseService';

interface Props {
  onLogout: () => void;
  school: SchoolInfo;
  userProfile: UserProfile;
}

const AcademicDashboard: React.FC<Props> = ({ onLogout, school, userProfile }) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'classes' | 'assignments'>('approvals');
  const [pendingStudents, setPendingStudents] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Biology');

  const [newClassName, setNewClassName] = useState('');
  const [newClassLevel, setNewClassLevel] = useState('Senior 4');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    if (activeTab === 'approvals') {
      const data = await fetchPendingStudents(school.name);
      setPendingStudents(data);
    } else if (activeTab === 'classes') {
      const data = await fetchSchoolClasses(school.name);
      setClasses(data);
    } else if (activeTab === 'assignments') {
      const data = await fetchTeachers(school.name);
      setTeachers(data);
    }
    setIsLoading(false);
  };

  const handleApprove = async (id: string) => {
    await updateStudentStatus(id, 'APPROVED');
    setPendingStudents(prev => prev.filter(s => s.id !== id));
    alert("Student Profile Approved & Activated.");
  };

  const handleCreateClass = async () => {
    if (!newClassName) return;
    const newCls = await createSchoolClass(school.name, newClassName, newClassLevel);
    setClasses(prev => [...prev, newCls]);
    setNewClassName('');
    alert(`Class ${newClassName} Created.`);
  };

  const handleAssign = async () => {
    if (!selectedTeacher) return;
    await assignCourseToTeacher(selectedTeacher, selectedSubject);
    alert(`Course Assigned to ${teachers.find(t => t.id === selectedTeacher)?.fullName}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-10">
      <header className="bg-white border-b border-slate-200 p-4 md:p-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 md:space-x-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-leaf-green rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transform rotate-2 text-sm md:text-xl">A</div>
             <div>
                <h1 className="font-montserrat font-bold text-uni-blue text-sm md:text-xl leading-tight">{userProfile.fullName}</h1>
                <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Director of Studies</p>
             </div>
          </div>
          <button onClick={onLogout} className="bg-slate-50 p-2 md:p-3 rounded-xl md:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200">
             <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
        {/* Academic Hub Navigation */}
        <div className="flex space-x-1.5 bg-white/70 backdrop-blur-md p-1.5 rounded-[24px] mb-8 md:mb-10 w-full md:w-fit border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
          {[
            { id: 'approvals', label: 'Enrollment', icon: '👤' },
            { id: 'classes', label: 'Classrooms', icon: '🏫' },
            { id: 'assignments', label: 'Teaching Staff', icon: '👩‍🏫' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-[18px] text-[10px] md:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-uni-blue shadow-lg text-white' : 'text-slate-500 hover:bg-white'}`}
            >
              <span className="text-sm md:text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'approvals' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-uni-blue">Enrollment Queue</h2>
                <p className="text-xs md:text-sm text-slate-500">Review student profiles for the syllabus.</p>
              </div>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-[32px] animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {pendingStudents.length === 0 ? (
                  <div className="col-span-full bg-white p-12 md:p-20 rounded-[32px] md:rounded-[40px] text-center border-2 border-dashed border-slate-100">
                    <p className="text-slate-300 font-bold text-sm">All caught up! No pending students.</p>
                  </div>
                ) : (
                  pendingStudents.map(student => (
                    <div key={student.id} className="bg-white p-4 md:p-6 rounded-[28px] md:rounded-[32px] border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl shadow-slate-200/40">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">👨‍🎓</div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-base md:text-lg">{student.fullName}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[9px] bg-crane-yellow/20 text-uni-blue px-2 py-0.5 rounded font-black tracking-tighter">{student.studentCode}</span>
                            <span className="text-[9px] text-slate-400 font-black uppercase truncate max-w-[120px]">{student.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full sm:w-auto space-x-2">
                        <button onClick={() => handleApprove(student.id)} className="flex-1 sm:flex-none bg-leaf-green text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Approve</button>
                        <button className="flex-1 sm:flex-none bg-slate-50 text-slate-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500">Decline</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="space-y-10 animate-in fade-in">
             <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
                <h2 className="text-lg md:text-xl font-bold text-uni-blue mb-6">Create New Classroom</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Class Name</label>
                    <input 
                      value={newClassName}
                      onChange={e => setNewClassName(e.target.value)}
                      placeholder="e.g. S.4 West" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm" 
                    />
                  </div>
                  <div className="md:w-48">
                    <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Senior Level</label>
                    <select 
                      value={newClassLevel}
                      onChange={e => setNewClassLevel(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm"
                    >
                      <option>Senior 1</option>
                      <option>Senior 2</option>
                      <option>Senior 3</option>
                      <option>Senior 4</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleCreateClass}
                    className="md:self-end bg-uni-blue text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-transform"
                  >
                    Open Class
                  </button>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {classes.map(cls => (
                  <div key={cls.id} className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm group hover:border-uni-blue transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <span className="bg-leaf-green/10 text-leaf-green px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{cls.level}</span>
                       <span className="text-2xl opacity-40">🏢</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{cls.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{cls.studentCount} Students Active</p>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                       <button className="text-[9px] font-black text-uni-blue uppercase tracking-widest hover:underline">Manage Students</button>
                       <span className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-xs group-hover:bg-uni-blue group-hover:text-white transition-all">→</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="animate-in fade-in space-y-8">
             <div className="bg-uni-blue text-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                <h2 className="text-xl md:text-2xl font-bold mb-2">Teaching Assignments</h2>
                <p className="text-white/60 text-xs md:text-sm max-w-lg mb-8">Link teachers to their specific subjects for instructional tracking.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <select 
                    value={selectedTeacher}
                    onChange={e => setSelectedTeacher(e.target.value)}
                    className="bg-white/10 border border-white/20 p-4 rounded-2xl text-white text-sm outline-none font-medium focus:bg-white/20"
                   >
                     <option value="" className="text-slate-800">Select Teacher...</option>
                     {teachers.map(t => <option key={t.id} value={t.id} className="text-slate-800">{t.fullName}</option>)}
                   </select>

                   <select 
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="bg-white/10 border border-white/20 p-4 rounded-2xl text-white text-sm outline-none font-medium focus:bg-white/20"
                   >
                     <option className="text-slate-800">Biology</option>
                     <option className="text-slate-800">Chemistry</option>
                     <option className="text-slate-800">Mathematics</option>
                     <option className="text-slate-800">Physics</option>
                     <option className="text-slate-800">English</option>
                   </select>

                   <button 
                    onClick={handleAssign}
                    className="bg-crane-yellow text-uni-blue font-black uppercase text-[10px] tracking-widest p-4 rounded-2xl hover:bg-white transition-all shadow-xl shadow-crane-yellow/20"
                   >
                     Confirm Link
                   </button>
                </div>
             </div>

             <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm">
                <h3 className="font-bold text-uni-blue mb-6 px-1">Active Staff Roles</h3>
                <div className="space-y-3 md:space-y-4">
                   {teachers.map(t => (
                     <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 bg-slate-50 rounded-[24px] md:rounded-[28px] border border-slate-100 gap-4">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100">👩‍🏫</div>
                           <div>
                              <p className="font-bold text-slate-800 text-sm md:text-base">{t.fullName}</p>
                              <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest">Senior Specialist</p>
                           </div>
                        </div>
                        <div className="flex space-x-2">
                           <span className="px-3 py-1 bg-uni-blue/10 text-uni-blue rounded-lg text-[9px] font-black uppercase tracking-tighter">Biology</span>
                           <span className="px-3 py-1 bg-leaf-green/10 text-leaf-green rounded-lg text-[9px] font-black uppercase tracking-tighter">Active</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AcademicDashboard;
