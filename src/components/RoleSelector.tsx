import React from "react";
import { GraduationCap, User } from "lucide-react";

interface RoleSelectorProps {
  onRoleSelect: (role: "lecturer" | "student") => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect }) => {
  return (
    <div className="min-h-screen bg-[#F1DEDE] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <GraduationCap className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Campus Attendance
          </h1>
          <p className="text-gray-600">Select your role to continue</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onRoleSelect("lecturer")}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-semibold">I'm a Lecturer</span>
          </button>

          <button
            onClick={() => onRoleSelect("student")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            <User className="h-6 w-6" />
            <span className="text-lg font-semibold">I'm a Student</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">University Management System</p>
        </div>
      </div>
    </div>
  );
};
