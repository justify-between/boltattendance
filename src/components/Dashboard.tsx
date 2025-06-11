import React from 'react';
import { BarChart3, Calendar, Clock, Users } from 'lucide-react';
import { Lecture } from '../types';

interface DashboardProps {
  lectures: Lecture[];
  currentTime: Date;
}

export const Dashboard: React.FC<DashboardProps> = ({ lectures, currentTime }) => {
  const today = new Date().toDateString();
  const todayLectures = lectures.filter(lecture => 
    new Date(lecture.date).toDateString() === today
  );

  const ongoingLectures = todayLectures.filter(lecture => {
    const lectureStart = new Date(`${lecture.date} ${lecture.startTime}`);
    const lectureEnd = new Date(`${lecture.date} ${lecture.endTime}`);
    return currentTime >= lectureStart && currentTime <= lectureEnd;
  });

  const totalAttendance = lectures.reduce((total, lecture) => total + lecture.attendees.length, 0);
  const averageAttendance = lectures.length > 0 ? Math.round(totalAttendance / lectures.length) : 0;

  const stats = [
    {
      title: 'Total Lectures',
      value: lectures.length,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Today\'s Lectures',
      value: todayLectures.length,
      icon: Clock,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Live Now',
      value: ongoingLectures.length,
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Avg. Attendance',
      value: averageAttendance,
      icon: Users,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {ongoingLectures.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Currently Live</h3>
          <div className="space-y-2">
            {ongoingLectures.map(lecture => (
              <div key={lecture.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-900">{lecture.courseName}</p>
                  <p className="text-sm text-gray-600">{lecture.location} • {lecture.attendees.length} present</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full animate-pulse">
                  Live
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};