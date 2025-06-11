/*
  # University Campus Attendance System Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `role` (enum: student, lecturer)
      - `student_id` (text, nullable for students)
      - `department` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `lectures`
      - `id` (uuid, primary key)
      - `course_name` (text)
      - `course_code` (text)
      - `lecturer_id` (uuid, references profiles)
      - `start_time` (time)
      - `end_time` (time)
      - `date` (date)
      - `location` (text)
      - `attendance_question` (text)
      - `attendance_answer` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `lecture_enrollments`
      - `id` (uuid, primary key)
      - `lecture_id` (uuid, references lectures)
      - `student_id` (uuid, references profiles)
      - `enrolled_at` (timestamp)

    - `attendance_records`
      - `id` (uuid, primary key)
      - `lecture_id` (uuid, references lectures)
      - `student_id` (uuid, references profiles)
      - `marked_at` (timestamp)
      - `student_answer` (text)
      - `is_correct` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Lecturers can manage their own lectures
    - Students can view lectures and mark attendance
    - Users can only access their own profile data
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('student', 'lecturer');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL,
  student_id text,
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lectures table
CREATE TABLE IF NOT EXISTS lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name text NOT NULL,
  course_code text NOT NULL,
  lecturer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time time NOT NULL,
  end_time time NOT NULL,
  date date NOT NULL,
  location text NOT NULL,
  attendance_question text NOT NULL,
  attendance_answer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lecture enrollments table
CREATE TABLE IF NOT EXISTS lecture_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(lecture_id, student_id)
);

-- Create attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marked_at timestamptz DEFAULT now(),
  student_answer text NOT NULL,
  is_correct boolean DEFAULT false,
  UNIQUE(lecture_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Lectures policies
CREATE POLICY "Anyone can read lectures"
  ON lectures
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Lecturers can create lectures"
  ON lectures
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'lecturer'
    )
  );

CREATE POLICY "Lecturers can update own lectures"
  ON lectures
  FOR UPDATE
  TO authenticated
  USING (
    lecturer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'lecturer'
    )
  );

CREATE POLICY "Lecturers can delete own lectures"
  ON lectures
  FOR DELETE
  TO authenticated
  USING (
    lecturer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'lecturer'
    )
  );

-- Lecture enrollments policies
CREATE POLICY "Students can read own enrollments"
  ON lecture_enrollments
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Lecturers can read enrollments for their lectures"
  ON lecture_enrollments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lectures 
      WHERE id = lecture_id AND lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Students can enroll in lectures"
  ON lecture_enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Attendance records policies
CREATE POLICY "Students can read own attendance"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Lecturers can read attendance for their lectures"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lectures 
      WHERE id = lecture_id AND lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Students can mark attendance"
  ON attendance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'student'
    ) AND
    EXISTS (
      SELECT 1 FROM lecture_enrollments 
      WHERE lecture_id = attendance_records.lecture_id AND student_id = auth.uid()
    )
  );

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    role, 
    student_id, 
    department
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      -- Check both possible locations for user data
      NEW.raw_user_meta_data->>'full_name',
      (NEW.raw_user_meta_data->'data'->>'full_name')
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      (NEW.raw_user_meta_data->'data'->>'role')::user_role,
      'student'::user_role  -- Default value
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'student_id',
      NEW.raw_user_meta_data->'data'->>'student_id'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'department',
      NEW.raw_user_meta_data->'data'->>'department'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lectures_updated_at
  BEFORE UPDATE ON lectures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();