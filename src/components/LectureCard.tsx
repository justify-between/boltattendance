import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
  Loader2,
} from "lucide-react"; // make sure Loader2 is imported
import { Lecture } from "../types";

interface LectureCardProps {
  lecture: Lecture;
  currentTime: Date;
  onMarkAttendance?: (lecture: Lecture) => void;
  onEnrollInLecture?: (lectureId: string) => Promise<void> | void;
  isStudent?: boolean;
}

export const LectureCard: React.FC<LectureCardProps> = ({
  lecture,
  currentTime,
  onMarkAttendance,
  onEnrollInLecture,
  isStudent = false,
}) => {
  const [loadingLectureId, setLoadingLectureId] = useState<string | null>(null);

  const lectureDateTime = new Date(`${lecture.date} ${lecture.start_time}`);
  const lectureEndTime = new Date(`${lecture.date} ${lecture.end_time}`);
  const isOngoing =
    currentTime >= lectureDateTime && currentTime <= lectureEndTime;
  const hasEnded = currentTime > lectureEndTime;
  const notStarted = currentTime < lectureDateTime;

  const getStatusBadge = () => {
    if (hasEnded) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Ended
        </span>
      );
    }
    if (isOngoing) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full animate-pulse">
          Live Now
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
        Upcoming
      </span>
    );
  };

  const handleEnroll = async () => {
    setLoadingLectureId(lecture.id);
    try {
      await onEnrollInLecture?.(lecture.id);
    } finally {
      setLoadingLectureId(null);
    }
  };

  const renderStudentActions = () => {
    if (!lecture.is_enrolled) {
      const isLoading = loadingLectureId === lecture.id;
      return (
        <button
          onClick={handleEnroll}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
            isLoading
              ? "bg-[#D496A7]/70 cursor-not-allowed"
              : "bg-[#D496A7] hover:shadow-xl transform hover:scale-105 text-white"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enrolling...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Enroll in Lecture</span>
            </>
          )}
        </button>
      );
    }

    if (lecture.has_attended) {
      return (
        <div className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg flex items-center justify-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span>Attendance Marked</span>
        </div>
      );
    }

    if (isOngoing) {
      return (
        <button
          onClick={() => onMarkAttendance?.(lecture)}
          className="w-full bg-[#D496A7] hover:shadow-xl transform hover:scale-105 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Mark Attendance</span>
        </button>
      );
    }

    return (
      <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg flex items-center justify-center space-x-2">
        <XCircle className="h-4 w-4" />
        <span>
          {notStarted ? "Attendance not available yet" : "Attendance closed"}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lecture.course_name}
          </h3>
          <p className="text-sm text-indigo-600 font-medium">
            {lecture.course_code}
          </p>
          {lecture.lecturer && (
            <p className="text-sm text-gray-600">
              by {lecture.lecturer.full_name}
            </p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{new Date(lecture.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>
            {lecture.start_time} - {lecture.end_time}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{lecture.location}</span>
        </div>
        {!isStudent && (
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>
              {lecture.attendance_count || 0} attended
              {lecture.enrollment_count
                ? ` / ${lecture.enrollment_count} enrolled`
                : ""}
            </span>
          </div>
        )}
      </div>

      {isStudent && renderStudentActions()}
    </div>
  );
};
