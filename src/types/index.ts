export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'lecturer';
  student_id?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface Lecture {
  id: string;
  course_name: string;
  course_code: string;
  lecturer_id: string;
  start_time: string;
  end_time: string;
  date: string;
  location: string;
  attendance_question: string;
  attendance_answer: string;
  created_at: string;
  updated_at: string;
  lecturer?: Profile;
  enrollment_count?: number;
  attendance_count?: number;
  is_enrolled?: boolean;
  has_attended?: boolean;
}

export interface LectureEnrollment {
  id: string;
  lecture_id: string;
  student_id: string;
  enrolled_at: string;
}

export interface AttendanceRecord {
  id: string;
  lecture_id: string;
  student_id: string;
  marked_at: string;
  student_answer: string;
  is_correct: boolean;
}

export type UserRole = 'lecturer' | 'student';