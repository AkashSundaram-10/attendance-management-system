import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building2, Check } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('admin@worktrackpro.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid email address.');
      return;
    }
    // Any credentials accepted for demo convenience per specs, default matches admin
    onLoginSuccess();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    if (password === '••••••••') {
      setPassword('admin123'); // Convert dots to real string on interaction
    }
  };

  return (
    <div className="bg-[#d4dbe2] min-h-screen w-full flex flex-col items-center justify-center p-6 relative select-none font-sans">
      <main className="w-full max-w-[420px]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl w-full p-8 flex flex-col gap-6 relative overflow-hidden border border-slate-200"
        >
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--primary-color)] to-[#9863ff]" />

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-1.5 pt-2">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-2 shadow-sm border border-slate-200">
              <Building2 className="text-[var(--primary-color)] w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500">
              Sign in to manage your workforce
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                className="text-xs font-semibold text-slate-500 ml-1" 
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="bg-slate-50 border border-slate-200 focus-within:border-[var(--primary-color)] rounded-lg flex items-center px-3.5 h-12 transition-all">
                <Mail className="text-slate-400 mr-3 w-5 h-5 flex-shrink-0" />
                <input
                  className="bg-transparent border-none outline-none w-full p-0 text-sm text-slate-800 focus:ring-0 placeholder-slate-400"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="admin@worktrackpro.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                className="text-xs font-semibold text-slate-500 ml-1" 
                htmlFor="password"
              >
                Password
              </label>
              <div className="bg-slate-50 border border-slate-200 focus-within:border-[var(--primary-color)] rounded-lg flex items-center px-3.5 h-12 transition-all relative">
                <Lock className="text-slate-400 mr-3 w-5 h-5 flex-shrink-0" />
                <input
                  className="bg-transparent border-none outline-none w-full p-0 text-sm text-slate-800 focus:ring-0 placeholder-slate-400 pr-8"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  required
                />
                <button
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none flex items-center justify-center p-1 rounded-full cursor-pointer"
                  onClick={togglePasswordVisibility}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between mt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="peer appearance-none w-4 h-4 rounded border border-slate-300 bg-white checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)] transition-all cursor-pointer outline-none focus:ring-0"
                  />
                  {rememberMe && (
                    <Check className="absolute text-white w-3 h-3 left-0.5 top-0.5 pointer-events-none stroke-[3px]" />
                  )}
                </div>
                <span className="text-slate-500 group-hover:text-slate-800 transition-colors">
                  Remember me
                </span>
              </label>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  alert("Demo Notice: Forgot password demo active. Credentials copy: admin@worktrackpro.com / admin123");
                }}
                className="text-[var(--primary-color)] hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[var(--primary-color)] to-[#645efb] text-white font-semibold text-sm shadow-[0px_8px_20px_rgba(75,65,225,0.15)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="submit"
              >
                Login
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
