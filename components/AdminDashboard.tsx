
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { UserProfile, SchoolInfo, Resource, StudentProgress } from '@/types';
import { fetchSystemHealth, fetchTeachers, fetchStudentProgress, fetchClassResources } from '@/lib/services/databaseService';

interface Props {
  onLogout: () => void;
  userProfile: UserProfile;
}

const AdminDashboard: React.FC<Props> = ({ onLogout, userProfile }) => {
  const [activeTab, setActiveTab] = useState<'mission' | 'users' | 'resources' | 'academic' | 'settings'>('mission');
  const [health, setHealth] = useState<{status: string, users: number, uptime: string} | null>(null);
  const [allStudents, setAllStudents] = useState<StudentProgress[]>([]);
  const [allTeachers, setAllTeachers] = useState<UserProfile[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  
  const [config, setConfig] = useState({
    instanceName: "Gayaza High School Hub",
    region: "Central Uganda",
    aiProvider: "Google Gemini 3",
    maintenanceMode: false
  });

  const chartData = [
    { name: 'Mon', logins: 400, queries: 2400 },
    { name: 'Tue', logins: 300, queries: 1398 },
    { name: 'Wed', logins: 200, queries: 9800 },
    { name: 'Thu', logins: 278, queries: 3908 },
    { name: 'Fri', logins: 189, queries: 4800 },
    { name: 'Sat', logins: 239, queries: 3800 },
    { name: 'Sun', logins: 349, queries: 4300 },
  ];

  useEffect(() => {
    const loadGlobalData = async () => {
      const h = await fetchSystemHealth();
      setHealth(h);
      const s = await fetchStudentProgress('Biology'); // Mock global sample
      setAllStudents(s);
      const t = await fetchTeachers('GLOBAL');
      setAllTeachers(t);
      const r = await fetchClassResources('GLOBAL');
      setAllResources(r);
    };
    loadGlobalData();
  }, []);

  const navItems = [
    { id: 'mission', label: 'Mission Control', icon: '📡' },
    { id: 'users', label: 'User Directory', icon: '👥' },
    { id: 'resources', label: 'Global Library', icon: '📚' },
    { id: 'academic', label: 'Academic Hub', icon: '🏫' },
    { id: 'settings', label: 'System Config', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e14] text-slate-300 flex flex-col md:flex-row font-sans selection:bg-uni-blue selection:text-white">
      {/* Sidebar - Pro Admin Style */}
      <aside className="w-full md:w-72 bg-[#0f172a] border-r border-slate-800 flex flex-col z-50">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-crane-yellow rounded-xl flex items-center justify-center text-slate-900 font-black text-xl shadow-[0_0_20px_rgba(252,220,4,0.3)]">Σ</div>
            <div>
              <h1 className="text-white font-montserrat font-black text-sm tracking-widest uppercase">Soma Admin</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Root Authority</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 group ${activeTab === item.id ? 'bg-uni-blue text-white shadow-lg shadow-uni-blue/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'opacity-100' : 'opacity-50'}`}>{item.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-leaf-green rounded-full animate-pulse shadow-[0_0_8px_rgba(76,175,80,0.8)]" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health</p>
            </div>
            <p className="text-xl font-mono font-black text-white">99.98%</p>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-red-500/20"
          >
            <span>🚪</span> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0a0e14]">
        {/* Top Header Bar */}
        <header className="sticky top-0 bg-[#0a0e14]/80 backdrop-blur-md border-b border-slate-800 p-6 z-40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-white text-2xl font-montserrat font-black uppercase tracking-tight">
                {navItems.find(n => n.id === activeTab)?.label}
              </h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Superuser Context: {userProfile.fullName}</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
               <div className="flex items-center gap-3 px-4 py-2 bg-[#0a0e14] rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500">API Latency:</span>
                  <span className="text-xs font-mono font-bold text-leaf-green">42ms</span>
               </div>
               <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg cursor-help">🔔</div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
          
          {activeTab === 'mission' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              {/* Global Insight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Active Sessions', val: '1,284', delta: '+12%', icon: '🔥', col: 'text-orange-500' },
                  { label: 'AI Tokens Used', val: '4.2M', delta: '+5%', icon: '🧠', col: 'text-uni-blue' },
                  { label: 'Resource Growth', val: '+240', delta: 'New', icon: '📦', col: 'text-leaf-green' },
                  { label: 'Uptime (24h)', val: '99.99%', delta: 'Peak', icon: '🔋', col: 'text-crane-yellow' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-[24px] hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">{stat.icon}</div>
                      <span className="text-[10px] font-black text-leaf-green">+{stat.delta}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-white">{stat.val}</h3>
                  </div>
                ))}
              </div>

              {/* Traffic Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[32px]">
                   <h3 className="text-white text-lg font-black uppercase tracking-widest mb-8">System Traffic Analysis</h3>
                   <div className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                          <Line type="monotone" dataKey="queries" stroke="#FCDC04" strokeWidth={4} dot={false} />
                          <Line type="monotone" dataKey="logins" stroke="#003366" strokeWidth={4} dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                   </div>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] flex flex-col">
                  <h3 className="text-white text-lg font-black uppercase tracking-widest mb-6">Recent Security Logs</h3>
                  <div className="space-y-4 flex-1">
                    {[
                      { ev: 'Root Login', time: '2m ago', stat: 'OK' },
                      { ev: 'API Config Changed', time: '14m ago', stat: 'OK' },
                      { ev: 'New Academic Hub IP', time: '1h ago', stat: 'WARN' },
                      { ev: 'Bulk Import Started', time: '2h ago', stat: 'OK' },
                    ].map((log, i) => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-slate-800">
                        <div>
                          <p className="text-xs font-bold text-slate-300">{log.ev}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{log.time}</p>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${log.stat === 'OK' ? 'bg-leaf-green/10 text-leaf-green' : 'bg-orange-500/10 text-orange-500'}`}>{log.stat}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-8 w-full py-4 bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all">View All Audit Logs</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                 <h3 className="text-white text-xl font-black uppercase tracking-widest">Global User Directory</h3>
                 <div className="flex gap-4">
                   <button className="px-6 py-2 bg-uni-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-uni-blue/20">Add Authority</button>
                 </div>
              </div>
              
              <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-800/50">
                     <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Role</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {[...allTeachers, ...allStudents.map(s => ({ id: s.studentId, fullName: s.studentName, role: 'student', email: 'verified' }))].map((u, i) => (
                       <tr key={i} className="hover:bg-white/5 transition-colors group">
                         <td className="px-8 py-5">
                            <p className="text-white font-bold text-sm">{u.fullName}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{u.id}</p>
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-uni-blue uppercase tracking-widest px-3 py-1 bg-uni-blue/10 rounded-full">{u.role}</span>
                         </td>
                         <td className="px-8 py-5">
                            <span className="flex items-center gap-2">
                               <span className="w-1.5 h-1.5 bg-leaf-green rounded-full shadow-[0_0_5px_rgba(76,175,80,0.8)]" />
                               <span className="text-[10px] text-slate-300 font-bold uppercase">Active</span>
                            </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <button className="text-slate-500 hover:text-white transition-colors">Edit Authority</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
               <h3 className="text-white text-xl font-black uppercase tracking-widest">Global Curriculum Resource Registry</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {allResources.map(res => (
                   <div key={res.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] hover:border-uni-blue/50 transition-all group">
                     <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:bg-uni-blue transition-colors">📄</div>
                     <h4 className="text-white font-bold text-lg mb-2">{res.title}</h4>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">{res.subject} • {res.unit}</p>
                     <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                        <button className="text-[10px] font-black text-red-400 uppercase tracking-widest">Withdraw Resource</button>
                        <button className="text-[10px] font-black text-uni-blue uppercase tracking-widest">Review Audit</button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-8 animate-in zoom-in-95">
               <div className="bg-slate-900 border border-slate-800 p-10 rounded-[48px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-leaf-green/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
                  <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-2">Academic Hub Oversight</h3>
                  <p className="text-slate-500 text-sm max-w-xl mb-10 leading-relaxed">Direct administrative bridge to Academic Directors and Directors of Studies. Control institutional hierarchy and enrollment approvals.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-slate-800/50 p-8 rounded-[32px] border border-slate-700">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">Staffing Insights</h4>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center py-2">
                              <span className="text-slate-400 text-[11px] font-bold uppercase">Teaching Specialists</span>
                              <span className="text-white font-black text-[11px]">{allTeachers.length} Active</span>
                           </div>
                           <div className="flex justify-between items-center py-2">
                              <span className="text-slate-400 text-[11px] font-bold uppercase">Classrooms Deployed</span>
                              <span className="text-white font-black text-[11px]">24 Units</span>
                           </div>
                        </div>
                        <button className="w-full mt-10 py-4 bg-uni-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-uni-blue/30">Enter Academic Console</button>
                     </div>
                     
                     <div className="bg-slate-800/50 p-8 rounded-[32px] border border-slate-700">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">Mastery Distribution</h4>
                        <div className="h-40">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={allStudents.slice(0, 5)}>
                                 <Bar dataKey="mastery" fill="#FCDC04" radius={[4, 4, 0, 0]} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                        <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4">Average Global Mastery: 64%</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-6">
               <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10">
                  <h3 className="text-white text-xl font-black uppercase tracking-widest mb-10 border-b border-slate-800 pb-6">Core System Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Infrastructure Instance Name</label>
                          <input 
                            value={config.instanceName}
                            onChange={e => setConfig({...config, instanceName: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl text-white font-medium outline-none focus:border-uni-blue transition-all"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Region</label>
                          <select className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl text-white font-medium outline-none focus:border-uni-blue transition-all appearance-none">
                             <option>Central Uganda (Kampala)</option>
                             <option>East Africa Node</option>
                          </select>
                       </div>
                    </div>
                    
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">AI Cognitive Engine</label>
                          <select className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl text-white font-medium outline-none focus:border-uni-blue transition-all appearance-none">
                             <option>Google Gemini 3 Flash (Latest)</option>
                             <option>Google Gemini 3 Pro (Enhanced)</option>
                          </select>
                       </div>
                       <div className="bg-slate-800 p-6 rounded-[28px] border border-slate-700 flex items-center justify-between">
                          <div>
                            <p className="text-white font-bold text-sm">System-Wide Maintenance</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Locks all non-admin access</p>
                          </div>
                          <button 
                            onClick={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})}
                            className={`w-14 h-8 rounded-full relative transition-colors ${config.maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
                          >
                             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${config.maintenanceMode ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-10 border-t border-slate-800 flex justify-end gap-4">
                     <button className="px-8 py-4 bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-700">Restore Defaults</button>
                     <button className="px-10 py-4 bg-uni-blue text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-uni-blue/20 hover:scale-105 transition-transform">Commit Infrastructure Updates</button>
                  </div>
               </div>
            </div>
          )}
          
        </div>

        {/* Console Status Bar */}
        <footer className="mt-20 p-8 border-t border-slate-800 text-center">
           <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.5em]">Soma-Agent Global Orchestrator • Authorized Access Only • v2.4.0-STABLE</p>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;
