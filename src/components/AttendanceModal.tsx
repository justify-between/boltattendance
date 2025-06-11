import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lecture } from '../types';

interface AttendanceModalProps {
  lecture: Lecture;
  onClose: () => void;
  onSuccess: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ 
  lecture, 
  onClose, 
  onSuccess 
}) => {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const isCorrect = answer.toLowerCase().trim() === lecture.attendance_answer.toLowerCase().trim();

      const { error } = await supabase
        .from('attendance_records')
        .insert({
          lecture_id: lecture.id,
          student_id: user.id,
          student_answer: answer.trim(),
          is_correct: isCorrect
        });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.code === '23505') {
        setError('You have already marked attendance for this lecture!');
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{lecture.course_name}</h3>
            <p className="text-sm text-gray-600">{lecture.course_code} • {lecture.location}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start mb-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Attendance Question</h4>
                  <p className="text-blue-800">{lecture.attendance_question}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your answer..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !answer.trim()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{isLoading ? 'Submitting...' : 'Mark Attendance'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};