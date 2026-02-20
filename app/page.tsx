'use client';

import React, { useState, useEffect } from 'react';
import Login from '@/components/Login';
import StudentDashboard from '@/components/StudentDashboard';
import TeacherDashboard from '@/components/TeacherDashboard';
import ParentDashboard from '@/components/ParentDashboard';
import AcademicDashboard from '@/components/AcademicDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { UserProfile, Resource, SchoolInfo, UserRole, ApprovalStatus } from '@/types';
import { supabase } from '@/lib/supabase/client';

const SCHOOL: SchoolInfo = {
  name: "Gayaza High School",
  location: "Wakiso, Uganda",
  motto: "Never Give Up"
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!error && data) {
          const profileData = data as any;
          setProfile({
            id: profileData.id,
            fullName: profileData.full_name,
            role: profileData.role,
            schoolId: profileData.school_id || '',
            email: profileData.email || '',
            status: profileData.status,
            studentCode: profileData.student_code || undefined,
          });
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userProfile: UserProfile) => {
    setProfile(userProfile);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setProfile(null);
  };

  const handleAddResource = (newRes: Resource) => {
    setResources(prev => [newRes, ...prev]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return <Login onLogin={handleLoginSuccess} schoolName={SCHOOL.name} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {profile.role === 'student' && (
        <StudentDashboard onLogout={handleLogout} resources={resources} school={SCHOOL} userProfile={profile} />
      )}
      
      {profile.role === 'teacher' && (
        <TeacherDashboard onLogout={handleLogout} resources={resources} onAddResource={handleAddResource} school={SCHOOL} userProfile={profile} />
      )}
      
      {profile.role === 'parent' && (
        <ParentDashboard onLogout={handleLogout} school={SCHOOL} userProfile={profile} />
      )}

      {profile.role === 'academic' && (
        <AcademicDashboard onLogout={handleLogout} school={SCHOOL} userProfile={profile} />
      )}

      {profile.role === 'admin' && (
        <AdminDashboard onLogout={handleLogout} userProfile={profile} />
      )}
      
      <div className="fixed inset-0 pointer-events-none african-pattern -z-10" />
    </div>
  );
}
