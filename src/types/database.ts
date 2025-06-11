export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'lecturer'
          student_id: string | null
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'lecturer'
          student_id?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'student' | 'lecturer'
          student_id?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lectures: {
        Row: {
          id: string
          course_name: string
          course_code: string
          lecturer_id: string
          start_time: string
          end_time: string
          date: string
          location: string
          attendance_question: string
          attendance_answer: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_name: string
          course_code: string
          lecturer_id: string
          start_time: string
          end_time: string
          date: string
          location: string
          attendance_question: string
          attendance_answer: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_name?: string
          course_code?: string
          lecturer_id?: string
          start_time?: string
          end_time?: string
          date?: string
          location?: string
          attendance_question?: string
          attendance_answer?: string
          created_at?: string
          updated_at?: string
        }
      }
      lecture_enrollments: {
        Row: {
          id: string
          lecture_id: string
          student_id: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          lecture_id: string
          student_id: string
          enrolled_at?: string
        }
        Update: {
          id?: string
          lecture_id?: string
          student_id?: string
          enrolled_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          lecture_id: string
          student_id: string
          marked_at: string
          student_answer: string
          is_correct: boolean
        }
        Insert: {
          id?: string
          lecture_id: string
          student_id: string
          marked_at?: string
          student_answer: string
          is_correct?: boolean
        }
        Update: {
          id?: string
          lecture_id?: string
          student_id?: string
          marked_at?: string
          student_answer?: string
          is_correct?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'lecturer'
    }
  }
}