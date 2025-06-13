import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const leftSlideIn = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const rightSlideIn = {
  hidden: { opacity: 0, x: 50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

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
    <div className="min-h-screen bg-[#F1DEDE] flex items-center justify-center p-4">
      <motion.a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <img
          width={80}
          height={80}
          src="/black_circle.png"
          alt="Click to visit Bolt"
          className="absolute top-4 right-4 cursor-pointer transition-transform duration-300 hover:rotate-180"
        />
      </motion.a>
      {/* <motion.a
        href="https://github.com/justify-between"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <img
          width={80}
          height={80}
          src="/black_circle.png"
          alt="Click to visit Bolt"
          className="absolute top-4 right-4 cursor-pointer transition-transform duration-300 hover:rotate-180"
        />
      </motion.a> */}

      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={scaleUp}>
            <GraduationCap className="h-16 w-16 text-[#D496A7] mx-auto mb-4" />
          </motion.div>
          <motion.h1
            className="text-3xl font-bold text-gray-900 mb-2"
            variants={leftSlideIn}
          >
            Bolt Attendance ⚡️
          </motion.h1>
          <motion.p className="text-gray-600" variants={rightSlideIn}>
            {isLogin ? "Sign in to your account" : "Create your account"}
          </motion.p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {!isLogin && (
            <>
              <motion.div variants={itemVariants}>
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
              </motion.div>

              <motion.div
                variants={itemVariants}
                ref={dropdownRef}
                className="relative"
              >
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
                  <motion.div
                    animate={{ rotate: showRoleDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </motion.div>
                </button>

                {showRoleDropdown && (
                  <motion.div
                    className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {["student", "lecturer"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          handleRoleSelect(role as "student" | "lecturer");
                          setShowRoleDropdown(false);
                        }}
                        className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        {role === "lecturer" ? (
                          <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                        ) : (
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                        )}
                        <span className="capitalize">{role}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {formData.role === "student" && (
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matric Number
                  </label>
                  <InputField
                    icon={User}
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="Enter your student ID"
                    required
                  />
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
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
              </motion.div>
            </>
          )}

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-lg p-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#D496A7] text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            {isLoading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </motion.button>
        </motion.form>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            type="button"
            onClick={() => setIsLogin((prev) => !prev)}
            className="text-[#D496A7] font-medium"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
