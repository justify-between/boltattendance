import React, { useState, useEffect } from "react";
import { Plus, Users, Calendar, TrendingUp, BookOpen } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Lecture, Profile } from "../types";
import { CreateLectureForm } from "./CreateLectureForm";
import { LectureCard } from "./LectureCard";
import toast from "react-hot-toast";

interface LecturerDashboardProps {
  currentTime: Date;
  profile: Profile;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({
  currentTime,
  profile,
}) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      // First get lectures without the join
      const { data: lecturesData, error: lecturesError } = await supabase
        .from("lectures")
        .select("*")
        .eq("lecturer_id", profile.id)
        .order("date", { ascending: false })
        .order("start_time", { ascending: false });

      if (lecturesError) throw lecturesError;

      // Get lecturer names separately
      const lecturerIds =
        lecturesData
          ?.map((l) => l.lecturer_id)
          .filter((v, i, a) => a.indexOf(v) === i) || [];

      const { data: lecturersData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", lecturerIds);

      const lecturerMap = new Map(
        lecturersData?.map((l) => [l.id, l.full_name]) || []
      );

      // Get enrollment and attendance counts
      const lectureIds = lecturesData?.map((l) => l.id) || [];

      const { data: enrollmentCounts } = await supabase
        .from("lecture_enrollments")
        .select("lecture_id")
        .in("lecture_id", lectureIds);

      const { data: attendanceCounts } = await supabase
        .from("attendance_records")
        .select("lecture_id")
        .in("lecture_id", lectureIds);

      const enrollmentMap = new Map();
      const attendanceMap = new Map();

      enrollmentCounts?.forEach((enrollment) => {
        enrollmentMap.set(
          enrollment.lecture_id,
          (enrollmentMap.get(enrollment.lecture_id) || 0) + 1
        );
      });

      attendanceCounts?.forEach((attendance) => {
        attendanceMap.set(
          attendance.lecture_id,
          (attendanceMap.get(attendance.lecture_id) || 0) + 1
        );
      });

      const enrichedLectures =
        lecturesData?.map((lecture) => ({
          ...lecture,
          lecturer_name: lecturerMap.get(lecture.lecturer_id) || "Unknown",
          enrollment_count: enrollmentMap.get(lecture.id) || 0,
          attendance_count: attendanceMap.get(lecture.id) || 0,
        })) || [];

      setLectures(enrichedLectures);
    } catch (error) {
      console.error("Error fetching lectures:", error);
      toast.error("Failed to load lectures");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchLectures();
  };

  const today = new Date().toDateString();
  const todayLectures = lectures.filter(
    (lecture) => new Date(lecture.date).toDateString() === today
  );

  const ongoingLectures = todayLectures.filter((lecture) => {
    const lectureStart = new Date(`${lecture.date} ${lecture.start_time}`);
    const lectureEnd = new Date(`${lecture.date} ${lecture.end_time}`);
    return currentTime >= lectureStart && currentTime <= lectureEnd;
  });

  const totalEnrollments = lectures.reduce(
    (total, lecture) => total + (lecture.enrollment_count || 0),
    0
  );
  const totalAttendance = lectures.reduce(
    (total, lecture) => total + (lecture.attendance_count || 0),
    0
  );
  const averageAttendance =
    totalEnrollments > 0
      ? Math.round((totalAttendance / totalEnrollments) * 100)
      : 0;

  const upcomingLectures = lectures
    .filter((lecture) => {
      const lectureStart = new Date(`${lecture.date} ${lecture.start_time}`);
      return lectureStart > currentTime;
    })
    .sort(
      (a, b) =>
        new Date(`${a.date} ${a.start_time}`).getTime() -
        new Date(`${b.date} ${b.start_time}`).getTime()
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Lecturer Dashboard
          </h2>
          <p className="text-gray-600">
            Welcome back, {profile.full_name}! Manage your lectures and track
            student attendance.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Create Lecture</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">
                Total Lectures
              </p>
              <p className="text-2xl font-bold">{lectures.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">
                Today's Classes
              </p>
              <p className="text-2xl font-bold">{todayLectures.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Live Now</p>
              <p className="text-2xl font-bold">{ongoingLectures.length}</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-30"></div>
              <TrendingUp className="h-8 w-8 text-amber-200 relative" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">
                Attendance Rate
              </p>
              <p className="text-2xl font-bold">{averageAttendance}%</p>
            </div>
            <Users className="h-8 w-8 text-rose-200" />
          </div>
        </div>
      </div>

      {/* Live Classes */}
      {ongoingLectures.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-green-900 mb-6 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            Classes In Progress
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {ongoingLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-white rounded-xl p-6 shadow-md border border-green-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {lecture.course_name}
                    </h4>
                    <p className="text-indigo-600 font-medium">
                      {lecture.course_code}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full animate-pulse">
                    Live Now
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Students Enrolled:
                    </span>
                    <span className="font-bold text-blue-700">
                      {lecture.enrollment_count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Present:</span>
                    <span className="font-bold text-green-700">
                      {lecture.attendance_count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">
                      {lecture.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">
                      {lecture.start_time} - {lecture.end_time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Lectures */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Upcoming Lectures
        </h3>
        {upcomingLectures.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No upcoming lectures scheduled</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              Create Your First Lecture
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingLectures.slice(0, 6).map((lecture) => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                currentTime={currentTime}
                isStudent={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Lectures */}
      {lectures.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Recent Lectures
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lectures.slice(0, 6).map((lecture) => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                currentTime={currentTime}
                isStudent={false}
              />
            ))}
          </div>
        </div>
      )}

      {showCreateForm && (
        <CreateLectureForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};
