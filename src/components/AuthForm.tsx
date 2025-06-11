import React, { useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

const InputField = ({
  icon: Icon,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}: {
  icon: React.ElementType;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
  </div>
);

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "student" as "student" | "lecturer",
    studentId: "",
    department: "",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role: "student" | "lecturer") => {
    setFormData((prev) => ({ ...prev, role }));
    setShowRoleDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading(
      isLogin ? "Signing in..." : "Creating account..."
    );

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.fullName,
                role: formData.role,
                student_id: formData.studentId || null,
                department: formData.department || null,
              },
            },
          }
        );
        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: authData.user.id,
              email: formData.email,
              full_name: formData.fullName,
              role: formData.role,
              student_id:
                formData.role === "student" ? formData.studentId : null,
              department: formData.department || null,
            });
          if (profileError) throw profileError;
        }
      }

      toast.dismiss(toastId);
      toast.success(isLogin ? "Signed in successfully!" : "Account created!");
      onAuthSuccess();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Authentication failed.");
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      {/* <a href="https://bolt.new" target="_blank" rel="noopener noreferrer">
        <img
          width={80}
          height={80}
          src="/black_circle.png"
          alt="Click to visit Bolt"
          className="absolute top-4 right-4  cursor-pointer transition-transform duration-300 hover:rotate-180"
        />
      </a> */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <GraduationCap className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Campus Attendance
          </h1>
          <p className="text-gray-600">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <InputField
                  icon={User}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                  aria-haspopup="listbox"
                  aria-expanded={showRoleDropdown}
                >
                  <div className="flex items-center">
                    {formData.role === "lecturer" ? (
                      <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                    ) : (
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <span className="capitalize">{formData.role}</span>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                    {["student", "lecturer"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() =>
                          handleRoleSelect(role as "student" | "lecturer")
                        }
                        className="w-full flex items-center px-4 py-3 hover:bg-gray-50"
                      >
                        {role === "lecturer" ? (
                          <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                        ) : (
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                        )}
                        <span className="capitalize">{role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {formData.role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID
                  </label>
                  <InputField
                    icon={User}
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="Enter your student ID"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department {formData.role === "student" ? "(Optional)" : ""}
                </label>
                <InputField
                  icon={GraduationCap}
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Enter your department"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <InputField
              icon={Mail}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin((prev) => !prev)}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};
