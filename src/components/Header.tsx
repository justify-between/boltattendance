import React from "react";
import { Clock, GraduationCap, User, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Profile } from "../types";
import toast from "react-hot-toast";

interface HeaderProps {
  profile: Profile;
  currentTime: string;
}

export const Header: React.FC<HeaderProps> = ({ profile, currentTime }) => {
  const handleSignOut = async () => {
    try {
      toast.loading("Signing out...", {});

      await supabase.auth.signOut();

      toast.success("Signed out successfully", { id: "signout-toast" });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Error signing out", { id: "signout-toast" });
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="bg-[#D496A7] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 overflow-x-auto">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Campus Attendance</h1>
              <p className="text-sm text-white">University Management System</p>
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
                <p className="text-xs text-white capitalize">{profile.role}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign Out</span>
            </button>

            {/* <a
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                width={50}
                height={50}
                src="/black_circle.png"
                alt="Click to visit Bolt"
                className="absolute top-4 right-4  cursor-pointer transition-transform duration-300 hover:rotate-180"
              />
            </a> */}
            <a
              href="https://github.com/justify-between"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                width={50}
                height={50}
                src="/black_circle.png"
                alt="Click to visit Bolt"
                className="absolute top-4 right-4  cursor-pointer transition-transform duration-300 hover:rotate-180"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
