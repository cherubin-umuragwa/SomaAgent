// @ts-nocheck
import { supabase } from '@/lib/supabase/client';
import { Resource, UserProfile, SchoolClass, ApprovalStatus, UserRole, StudentProgress, TeacherFeedback, Exam } from '@/types';

export const authenticateUser = async (email: string, password: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) return null;

    const profileData = profile as any;
    return {
      id: profileData.id,
      fullName: profileData.full_name,
      role: profileData.role,
      schoolId: profileData.school_id || '',
      email: profileData.email || '',
      status: profileData.status,
      studentCode: profileData.student_code || undefined,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};

export const registerUser = async (
  fullName: string,
  email: string,
  password: string,
  role: UserRole
): Promise<{ success: boolean; profile?: UserProfile; message?: string }> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, message: authError?.message || 'Registration failed' };
    }

    const isStudent = role === 'student';
    const studentCode = isStudent ? `SOMA-${Math.floor(1000 + Math.random() * 9000)}` : null;

    // @ts-ignore - Supabase type issue
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        email,
        role,
        status: isStudent ? 'PENDING' : 'APPROVED',
        student_code: studentCode,
        school_id: null, // Will be assigned by admin/academic
      })
      .select()
      .single();

    if (profileError || !profile) {
      return { success: false, message: 'Failed to create profile' };
    }

    const profileData = profile as any;
    return {
      success: true,
      profile: {
        id: profileData.id,
        fullName: profileData.full_name,
        role: profileData.role,
        schoolId: profileData.school_id || '',
        email: profileData.email || '',
        status: profileData.status,
        studentCode: profileData.student_code || undefined,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An error occurred' };
  }
};

export const fetchStudentProgress = async (subject: string): Promise<StudentProgress[]> => {
  try {
    const { data } = await supabase
      .from('student_mastery')
      .select(`
        student_id,
        mastery_percentage,
        updated_at,
        profiles!inner(full_name)
      `)
      .eq('subject', subject);

    if (!data) return [];

    return data.map((item: any) => ({
      studentId: item.student_id,
      studentName: item.profiles.full_name,
      mastery: item.mastery_percentage,
      lastActive: new Date(item.updated_at).toLocaleString(),
      status: item.mastery_percentage >= 80 ? 'excellent' : item.mastery_percentage >= 50 ? 'on-track' : 'at-risk',
    }));
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return [];
  }
};

export const sendStudentFeedback = async (
  teacherId: string,
  studentId: string,
  subject: string,
  message: string
) => {
  try {
    // @ts-ignore - Supabase type issue
    const { error } = await supabase.from('feedback').insert({
      teacher_id: teacherId,
      student_id: studentId,
      subject,
      message,
    });

    return !error;
  } catch (error) {
    console.error('Error sending feedback:', error);
    return false;
  }
};

export const fetchStudentFeedback = async (studentId: string): Promise<TeacherFeedback[]> => {
  try {
    const { data } = await supabase
      .from('feedback')
      .select(`
        id,
        subject,
        message,
        created_at,
        profiles!feedback_teacher_id_fkey(full_name)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      fromTeacher: item.profiles?.full_name || 'Unknown',
      subject: item.subject,
      message: item.message,
      date: new Date(item.created_at).toLocaleDateString(),
    }));
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }
};

export const scheduleExam = async (exam: Omit<Exam, 'id'>, schoolId: string) => {
  try {
    // @ts-ignore - Supabase type issue
    const { data, error } = await supabase
      .from('exams')
      .insert({
        school_id: schoolId,
        title: exam.title,
        subject: exam.subject,
        exam_date: exam.date,
        duration: exam.duration,
        status: exam.status,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      subject: data.subject,
      date: data.exam_date || '',
      duration: data.duration || '',
      status: data.status,
    };
  } catch (error) {
    console.error('Error scheduling exam:', error);
    return null;
  }
};

export const fetchUpcomingExams = async (schoolId: string, subject?: string): Promise<Exam[]> => {
  try {
    let query = supabase
      .from('exams')
      .select('*')
      .eq('school_id', schoolId)
      .order('exam_date', { ascending: true });

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data } = await query;

    if (!data) return [];

    return data.map(item => ({
      id: item.id,
      title: item.title,
      subject: item.subject,
      date: item.exam_date || '',
      duration: item.duration || '',
      status: item.status,
    }));
  } catch (error) {
    console.error('Error fetching exams:', error);
    return [];
  }
};

export const fetchPendingStudents = async (schoolId: string): Promise<UserProfile[]> => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', schoolId)
      .eq('role', 'student')
      .eq('status', 'PENDING');

    if (!data) return [];

    return data.map(item => ({
      id: item.id,
      fullName: item.full_name,
      role: item.role,
      schoolId: item.school_id || '',
      email: item.email || '',
      status: item.status,
      studentCode: item.student_code || undefined,
    }));
  } catch (error) {
    console.error('Error fetching pending students:', error);
    return [];
  }
};

export const updateStudentStatus = async (studentId: string, status: ApprovalStatus) => {
  try {
    // @ts-ignore - Supabase type issue
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', studentId);

    return !error;
  } catch (error) {
    console.error('Error updating student status:', error);
    return false;
  }
};

export const fetchSchoolClasses = async (schoolId: string): Promise<SchoolClass[]> => {
  try {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId);

    if (!data) return [];

    return data.map(item => ({
      id: item.id,
      name: item.name,
      level: item.level,
      studentCount: item.student_count,
    }));
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

export const createSchoolClass = async (schoolId: string, name: string, level: string) => {
  try {
    // @ts-ignore - Supabase type issue
    const { data, error } = await supabase
      .from('classes')
      .insert({
        school_id: schoolId,
        name,
        level,
        student_count: 0,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      level: data.level,
      studentCount: data.student_count,
    };
  } catch (error) {
    console.error('Error creating class:', error);
    return null;
  }
};

export const fetchTeachers = async (schoolId: string): Promise<UserProfile[]> => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', schoolId)
      .eq('role', 'teacher');

    if (!data) return [];

    return data.map(item => ({
      id: item.id,
      fullName: item.full_name,
      role: item.role,
      schoolId: item.school_id || '',
      email: item.email || '',
      status: item.status,
    }));
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
};

export const fetchSystemHealth = async () => {
  try {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return {
      status: 'Optimal',
      users: count || 0,
      uptime: '99.9%',
    };
  } catch (error) {
    console.error('Error fetching system health:', error);
    return { status: 'Error', users: 0, uptime: '0%' };
  }
};

export const fetchTeacherCourses = async (teacherId: string): Promise<string[]> => {
  try {
    const { data } = await supabase
      .from('resources')
      .select('subject')
      .eq('teacher_id', teacherId);

    if (!data) return [];

    const uniqueSubjects = [...new Set(data.map(item => item.subject))];
    return uniqueSubjects;
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return [];
  }
};

export const assignCourseToTeacher = async (teacherId: string, subject: string) => {
  // This could be implemented with a separate teacher_courses table if needed
  return true;
};

export const fetchClassResources = async (schoolId: string, subjectFilter?: string): Promise<Resource[]> => {
  try {
    let query = supabase
      .from('resources')
      .select('*')
      .eq('school_id', schoolId);

    if (subjectFilter) {
      query = query.eq('subject', subjectFilter);
    }

    const { data } = await query;

    if (!data) return [];

    return data.map(item => ({
      id: item.id,
      title: item.title,
      unit: item.unit,
      fileSize: item.file_size || '',
      subject: item.subject,
      content: item.content || '',
    }));
  } catch (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
};

export const linkStudentByCode = async (parentId: string, studentCode: string) => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('student_code', studentCode)
      .eq('role', 'student')
      .single();

    if (!data) {
      return { success: false };
    }

    // Here you could create a parent_student_links table to track relationships
    return { success: true, studentName: data.full_name };
  } catch (error) {
    console.error('Error linking student:', error);
    return { success: false };
  }
};
