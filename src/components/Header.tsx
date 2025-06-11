import React from "react";
import { Clock, GraduationCap, User, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Profile } from "../types";

interface HeaderProps {
  profile: Profile;
  currentTime: string;
}

export const Header: React.FC<HeaderProps> = ({ profile, currentTime }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Campus Attendance</h1>
              <p className="text-sm text-indigo-200">
                University Management System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{currentTime}</span>
            </div>

            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <div className="text-right">
                <p className="text-sm font-medium">{profile.full_name}</p>
                <p className="text-xs text-indigo-200 capitalize">
                  {profile.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
