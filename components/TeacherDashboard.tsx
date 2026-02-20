
'use client';

import React, { useState, useEffect } from 'react';
import { Resource, SchoolInfo, UserProfile, StudentProgress, Exam } from '@/types';
import { fetchTeacherCourses, fetchStudentProgress, sendStudentFeedback, scheduleExam, fetchUpcomingExams } from '@/lib/services/databaseService';

interface Props {
  onLogout: () => void;
  resources: Resource[];
  onAddResource: (res: Resource) => void;
  school: SchoolInfo;
  userProfile: UserProfile;
}

const TeacherDashboard: React.FC<Props> = ({ onLogout, resources, onAddResource, school, userProfile }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'students' | 'exams'>('library');
  const [showUpload, setShowUpload] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Biology');
  const [myCourses, setMyCourses] = useState<string[]>([]);
  
  const [studentList, setStudentList] = useState<StudentProgress[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');

  useEffect(() => {
    const loadInit = async () => {
      const courses = await fetchTeacherCourses(userProfile.id);
      setMyCourses(courses);
      if (courses.length > 0) setSelectedSubject(courses[0]);
    };
    loadInit();
  }, [userProfile.id]);

  useEffect(() => {
    const loadSubjectData = async () => {
      const progress = await fetchStudentProgress(selectedSubject);
      setStudentList(progress);
      const exams = await fetchUpcomingExams(selectedSubject);
      setUpcomingExams(exams);
    };
    loadSubjectData();
  }, [selectedSubject]);

  const handlePublishResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    onAddResource({
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      unit: 'Unit ' + (resources.length + 1),
      fileSize: '1.2 MB',
      subject: selectedSubject
    });
    setNewTitle(''); setNewContent(''); setShowUpload(false);
  };

  const handleSendFeedback = async () => {
    if (!selectedStudentId || !feedbackMsg) return;
    await sendStudentFeedback(userProfile.fullName, selectedStudentId, selectedSubject, feedbackMsg);
    setFeedbackMsg(''); setSelectedStudentId(null);
    alert("Feedback sent successfully!");
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle || !examDate) return;
    const n = await scheduleExam({
      title: examTitle,
      date: examDate,
      subject: selectedSubject,
      duration: '1 Hour',
      status: 'upcoming'
    });
    setUpcomingExams([...upcomingExams, n]);
    setExamTitle(''); setExamDate('');
    alert("Exam scheduled and students notified.");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
      <header className="bg-white border-b border-slate-200 p-4 md:p-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 md:space-x-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-uni-blue rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">T</div>
             <div>
                <h1 className="font-montserrat font-bold text-uni-blue text-sm md:text-lg">{userProfile.fullName}</h1>
                <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">{school.name}</p>
             </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <select 
              value={selectedSubject} 
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold outline-none"
            >
              {myCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={onLogout} className="bg-red-50 text-red-500 p-2 md:p-3 rounded-xl md:rounded-2xl hover:bg-red-500 hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Teacher Navigation Tabs */}
      <div className="bg-white border-b border-slate-100 overflow-x-auto scrollbar-hide">
         <div className="max-w-7xl mx-auto px-6 flex space-x-6 md:space-x-8 min-w-max">
            <button onClick={() => setActiveTab('library')} className={`py-4 text-[10px] md:text-xs font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'library' ? 'border-uni-blue text-uni-blue' : 'border-transparent text-slate-400'}`}>Library</button>
            <button onClick={() => setActiveTab('students')} className={`py-4 text-[10px] md:text-xs font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'students' ? 'border-uni-blue text-uni-blue' : 'border-transparent text-slate-400'}`}>Class Progress</button>
            <button onClick={() => setActiveTab('exams')} className={`py-4 text-[10px] md:text-xs font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'exams' ? 'border-uni-blue text-uni-blue' : 'border-transparent text-slate-400'}`}>Assessments</button>
         </div>
      </div>

      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'library' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-uni-blue">Course Resources</h2>
                <button onClick={() => setShowUpload(true)} className="w-full sm:w-auto bg-leaf-green text-white px-6 py-4 md:py-3 rounded-2xl font-bold text-xs shadow-lg hover:scale-105 transition-transform flex items-center justify-center space-x-2">
                  <span>➕</span> <span>New Lesson Notes</span>
                </button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {resources.filter(r => r.subject === selectedSubject).map(res => (
                  <div key={res.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm group hover:border-uni-blue transition-all">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-4">📄</div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{res.title}</h4>
                    <p className="text-xs text-slate-400 font-medium mb-6">{res.unit} • {res.fileSize}</p>
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] md:text-[10px] bg-uni-blue/10 text-uni-blue px-3 py-1 rounded-full font-bold">LIVE</span>
                       <button className="text-[9px] md:text-[10px] font-bold text-red-400">Archive</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                   <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Student Name</th>
                        <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Mastery</th>
                        <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Last Activity</th>
                        <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {studentList.map(s => (
                        <tr key={s.studentId} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-6 md:px-8 py-5 md:py-6">
                              <p className="font-bold text-slate-800 text-sm">{s.studentName}</p>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${s.status === 'excellent' ? 'bg-leaf-green/10 text-leaf-green' : s.status === 'at-risk' ? 'bg-red-50 text-red-500' : 'bg-crane-yellow/10 text-crane-yellow-dark'}`}>{s.status.toUpperCase()}</span>
                           </td>
                           <td className="px-6 md:px-8 py-5 md:py-6">
                              <div className="flex items-center space-x-3">
                                 <div className="flex-1 bg-slate-100 h-1.5 w-16 md:w-24 rounded-full overflow-hidden">
                                    <div className="bg-uni-blue h-full rounded-full" style={{width: `${s.mastery}%`}} />
                                 </div>
                                 <span className="text-[10px] font-mono font-bold text-slate-500">{s.mastery}%</span>
                              </div>
                           </td>
                           <td className="px-6 md:px-8 py-5 md:py-6 text-[10px] text-slate-400 uppercase font-bold">{s.lastActive}</td>
                           <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                              <button onClick={() => setSelectedStudentId(s.studentId)} className="bg-uni-blue text-white px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-bold shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity">Guidance</button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 animate-in fade-in">
             <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-slate-200 shadow-xl shadow-slate-200/40">
                <h2 className="text-xl md:text-2xl font-bold text-uni-blue mb-2">Schedule Assessment</h2>
                <p className="text-xs md:text-sm text-slate-400 mb-8">Set specialized exams for students in {selectedSubject}.</p>
                <form onSubmit={handleCreateExam} className="space-y-6">
                   <div>
                      <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Exam Title</label>
                      <input value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder="e.g. Unit 4 Quiz" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" />
                   </div>
                   <div>
                      <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Date & Time</label>
                      <input type="datetime-local" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
                   </div>
                   <button className="w-full bg-uni-blue text-white py-4 md:py-5 rounded-2xl font-bold text-xs md:text-sm shadow-xl shadow-uni-blue/30 transform active:scale-95 transition-all">Notify Class of Exam</button>
                </form>
             </div>

             <div className="space-y-6">
                <h3 className="text-lg md:text-xl font-bold text-slate-800">Scheduled Exams</h3>
                {upcomingExams.length === 0 ? <p className="text-slate-400 italic text-sm">No exams scheduled for this term.</p> : (
                  upcomingExams.map(e => (
                    <div key={e.id} className="bg-slate-900 p-6 md:p-8 rounded-[32px] md:rounded-[40px] text-white border-l-8 border-crane-yellow shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                       <div className="relative z-10">
                          <p className="text-[9px] md:text-[10px] font-bold text-crane-yellow uppercase tracking-widest mb-2">{e.subject} • {e.status}</p>
                          <h4 className="text-xl md:text-2xl font-bold mb-4">{e.title}</h4>
                          <div className="flex items-center space-x-6 text-[10px] md:text-sm opacity-60">
                             <span className="flex items-center space-x-2">📅 <span>{e.date.split('T')[0]}</span></span>
                             <span className="flex items-center space-x-2">⏱️ <span>{e.duration}</span></span>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      {selectedStudentId && (
        <div className="fixed inset-0 bg-uni-blue/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[32px] md:rounded-[40px] shadow-2xl p-6 md:p-10 animate-in zoom-in-95">
              <h3 className="text-xl md:text-2xl font-bold text-uni-blue mb-2">Academic Guidance</h3>
              <p className="text-xs md:text-sm text-slate-500 mb-6">Feedback for <b>{studentList.find(s => s.studentId === selectedStudentId)?.studentName}</b></p>
              <textarea 
                value={feedbackMsg} 
                onChange={e => setFeedbackMsg(e.target.value)}
                placeholder="Write your advice here..." 
                className="w-full p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-3xl h-40 md:h-48 outline-none mb-6 font-medium text-slate-700 text-sm"
              />
              <div className="flex space-x-3 md:space-x-4">
                 <button onClick={() => setSelectedStudentId(null)} className="flex-1 py-3 md:py-4 font-bold text-[10px] md:text-sm text-slate-400 hover:text-slate-600">Cancel</button>
                 <button onClick={handleSendFeedback} className="flex-1 py-3 md:py-4 bg-leaf-green text-white font-bold rounded-xl md:rounded-2xl shadow-lg text-[10px] md:text-sm">Deliver Message</button>
              </div>
           </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[32px] md:rounded-[48px] shadow-2xl p-6 md:p-12 overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl md:text-3xl font-bold text-uni-blue mb-2">Publish Notes</h2>
              <p className="text-xs md:text-sm text-slate-500 mb-8 md:mb-10">Shared resources are instantly visible to your classes.</p>
              <form onSubmit={handlePublishResource} className="space-y-4 md:space-y-6">
                 <div>
                    <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Topic Title</label>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-sm" placeholder="e.g. Properties of Mammals" />
                 </div>
                 <div>
                    <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Core Content</label>
                    <textarea value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 md:h-40 outline-none font-medium text-sm" placeholder="Paste lesson content here..."></textarea>
                 </div>
                 <div className="flex space-x-3 md:space-x-4 pt-4">
                    <button type="button" onClick={() => setShowUpload(false)} className="flex-1 py-4 font-bold text-[10px] md:text-sm text-slate-400">Cancel</button>
                    <button type="submit" className="flex-1 py-4 bg-uni-blue text-white rounded-xl md:rounded-2xl font-bold shadow-xl shadow-uni-blue/30 text-[10px] md:text-sm">Publish Resource</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
