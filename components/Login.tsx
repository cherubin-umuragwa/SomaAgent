'use client';

import React, { useState } from 'react';
import { UserRole, UserProfile } from '@/types';
import { authenticateUser, registerUser } from '@/lib/services/databaseService';

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
  schoolName: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, schoolName }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const selectRoleAndPopulate = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!email) return setError('Email is required');
    if (!password) return setError('Password is required');
    if (isRegistering && !fullName) return setError('Full Name is required');
    
    setIsLoading(true);

    try {
      if (isRegistering) {
        const result = await registerUser(fullName, email, password, role);
        if (result.success && result.profile) {
          if (role === 'student') {
            setSuccessMsg(`Registration received. Student ID: ${result.profile.studentCode}. Pending approval.`);
            setIsRegistering(false);
          } else if (role === 'teacher') {
            setSuccessMsg(`Teacher account initialized. You can now sign in.`);
            setIsRegistering(false);
          } else {
            onLogin(result.profile);
          }
        } else {
          setError(result.message || 'Registration failed');
        }
      } else {
        const profile = await authenticateUser(email, password);
        if (profile) {
          if (profile.role === 'student' && profile.status === 'PENDING') {
            setError('Account pending academic approval.');
          } else {
            onLogin(profile);
          }
        } else {
          setError('Invalid login credentials.');
        }
      }
    } catch (err) {
      setError('System connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles: { id: UserRole; label: string; icon: string }[] = [
    { id: 'student', label: 'Student', icon: '👨‍🎓' },
    { id: 'teacher', label: 'Teacher', icon: '👩‍🏫' },
    { id: 'parent', label: 'Parent', icon: '🏡' },
    { id: 'academic', label: 'Academic', icon: '📋' },
    { id: 'admin', label: 'Admin', icon: '🛡️' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-blue-900 relative p-4 md:p-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none african-pattern opacity-10" />
      
      <div className="flex flex-col items-center mb-8 z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-4 border-4 border-white/20 transform hover:scale-105 transition-transform duration-300">
           <svg className="w-16 h-16 text-blue-900" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 5V11C4 16.06 7.41 20.74 12 22C16.59 20.74 20 16.06 20 11V5L12 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 6V18M12 6L9 9M12 6L15 9M12 18L9 15M12 18L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
           </svg>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase drop-shadow-md">Soma-Agent</h1>
        <p className="text-white/60 font-bold text-[10px] uppercase tracking-[0.4em] mt-1 text-center">{schoolName}</p>
      </div>

      <div className="w-full max-w-[460px] z-10">
        <div className="bg-white rounded-[2.5rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.4)] p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isRegistering ? 'Enroll Today' : 'Secure Access'}
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-2">Select your role</p>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-10">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => selectRoleAndPopulate(r.id)}
                className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all duration-300 group ${role === r.id ? 'bg-blue-900 border-blue-900 shadow-lg scale-110 z-20' : 'bg-slate-50 border-slate-50 hover:bg-slate-100'}`}
              >
                <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110">{r.icon}</span>
                <span className={`text-[8px] font-black uppercase tracking-tighter text-center px-1 ${role === r.id ? 'text-white' : 'text-slate-400'}`}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-xs font-bold text-center animate-in slide-in-from-top-2">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleAuthAction} className="space-y-5">
            {isRegistering && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-900 transition-colors">👤</span>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Legal Full Name" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-900 outline-none transition-all font-medium text-sm text-slate-700 placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-900 transition-colors">✉️</span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Institutional ID / Email" 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-900 outline-none transition-all font-medium text-sm text-slate-700 placeholder:text-slate-300"
              />
            </div>

            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-900 transition-colors">🔒</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access Pin / Password" 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-900 outline-none transition-all font-medium text-sm text-slate-700 placeholder:text-slate-300"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-[11px] font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-blue-900 text-white font-black uppercase tracking-[0.25em] rounded-[1.25rem] shadow-2xl shadow-blue-900/30 hover:bg-blue-800 transform active:scale-[0.98] transition-all disabled:opacity-50 text-[11px] flex items-center justify-center gap-4 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{isRegistering ? 'Initialize Account' : `Enter as ${role}`}</span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              {isRegistering ? 'Already registered?' : "Don't have a profile?"}{' '}
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-blue-900 font-black hover:underline ml-1"
              >
                {isRegistering ? 'Login Instead' : 'Create Profile'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-10 text-center flex flex-col items-center gap-5">
          <div className="flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full border border-white/5 backdrop-blur-sm">
             <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(76,175,80,0.8)] animate-pulse" />
             <p className="text-[10px] text-white font-black uppercase tracking-[0.2em]">NCDC Hub Online • Secure Session</p>
          </div>
          <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.5em]">Orchestrator Platform v3.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
