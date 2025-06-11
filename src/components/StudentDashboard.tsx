import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lecture, Profile } from '../types';
import { LectureCard } from './LectureCard';
import { AttendanceModal } from './AttendanceModal';

interface StudentDashboardProps {
  currentTime: Date;
  profile: Profile;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentTime,
  profile
}) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      const { data: lecturesData, error: lecturesError } = await supabase
        .from('lectures')
        .select(`
          *,
          lecturer:profiles!lectures_lecturer_id_fkey(full_name)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (lecturesError) throw lecturesError;

      // Get enrollment and attendance data
      const { data: enrollments } = await supabase
        .from('lecture_enrollments')
        .select('lecture_id')
        .eq('student_id', profile.id);

      const { data: attendanceRecords } = await supabase
        .from('attendance_records')
        .select('lecture_id')
        .eq('student_id', profile.id);

      const enrolledLectureIds = new Set(enrollments?.map(e => e.lecture_id) || []);
      const attendedLectureIds = new Set(attendanceRecords?.map(a => a.lecture_id) || []);

      const enrichedLectures = lecturesData?.map(lecture => ({
        ...lecture,
        is_enrolled: enrolledLectureIds.has(lecture.id),
        has_attended: attendedLectureIds.has(lecture.id)
      })) || [];

      setLectures(enrichedLectures);
    } catch (error) {
      console.error('Error fetching lectures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollInLecture = async (lectureId: string) => {
    try {
      const { error } = await supabase
        .from('lecture_enrollments')
        .insert({
          lecture_id: lectureId,
          student_id: profile.id
        });

      if (error) throw error;

      // Update local state
      setLectures(prev => prev.map(lecture => 
        lecture.id === lectureId 
          ? { ...lecture, is_enrolled: true }
          : lecture
      ));
    } catch (error: any) {
      if (error.code === '23505') {
        alert('You are already enrolled in this lecture!');
      } else {
        alert('Failed to enroll in lecture: ' + error.message);
      }
    }
  };

  const handleMarkAttendance = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setShowAttendanceModal(true);
  };

  const handleAttendanceSuccess = () => {
    fetchLectures(); // Refresh data
  };

  const today = new Date().toDateString();
  const todayLectures = lectures.filter(lecture => 
    new Date(lecture.date).toDateString() === today
  );

  const enrolledLectures = lectures.filter(lecture => lecture.is_enrolled);
  const availableLectures = lectures.filter(lecture => !lecture.is_enrolled);

  const ongoingLectures = enrolledLectures.filter(lecture => {
    const lectureStart = new Date(`${lecture.date} ${lecture.start_time}`);
    const lectureEnd = new Date(`${lecture.date} ${lecture.end_time}`);
    return currentTime >= lectureStart && currentTime <= lectureEnd;
  });

  const attendedToday = todayLectures.filter(lecture => lecture.has_attended);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Dashboard</h2>
        <p className="text-gray-600">Welcome back, {profile.full_name}! Track your attendance and manage your enrolled lectures.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Enrolled Lectures</p>
              <p className="text-2xl font-bold">{enrolledLectures.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Attended Today</p>
              <p className="text-2xl font-bold">{attendedToday.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Live Classes</p>
              <p className="text-2xl font-bold">{ongoingLectures.length}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">Available Lectures</p>
              <p className="text-2xl font-bold">{availableLectures.length}</p>
            </div>
            <UserPlus className="h-8 w-8 text-rose-200" />
          </div>
        </div>
      </div>

      {/* Live Classes */}
      {ongoingLectures.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-green-900 mb-6 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            Classes Happening Now
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {ongoingLectures.map(lecture => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                currentTime={currentTime}
                onMarkAttendance={handleMarkAttendance}
                isStudent={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Lectures to Enroll */}
      {availableLectures.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Available Lectures</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableLectures.slice(0, 6).map(lecture => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                currentTime={currentTime}
                onEnrollInLecture={handleEnrollInLecture}
                isStudent={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Lectures */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">My Enrolled Lectures</h3>
        {enrolledLectures.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You haven't enrolled in any lectures yet</p>
            <p className="text-sm text-gray-500">Browse available lectures above to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledLectures.map(lecture => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                currentTime={currentTime}
                onMarkAttendance={handleMarkAttendance}
                isStudent={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && selectedLecture && (
        <AttendanceModal
          lecture={selectedLecture}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedLecture(null);
          }}
          onSuccess={handleAttendanceSuccess}
        />
      )}
    </div>
  );
};