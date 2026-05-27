import { useState, useRef, useEffect } from 'react';
import { Bell, ArrowLeft, Edit, Calendar, User, Phone, Mail } from 'lucide-react';
import { AppView } from '../types';

interface TopAppBarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onBack: () => void;
  onEditProfile?: () => void;
  notificationsCount: number;
  onClearNotifications: () => void;
  onMenuToggle?: () => void;
}

export default function TopAppBar({
  currentView,
  setView,
  onBack,
  onEditProfile,
  notificationsCount,
  onClearNotifications,
  onMenuToggle,
}: TopAppBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  // If we are in detailed sub-pages, show back arrow headers
  const isProfile = currentView === 'worker-profile';
  const isAdvances = currentView === 'advance-payments';

  if (isProfile) {
    return (
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-5 py-4 flex justify-between items-center border-b border-slate-200">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-850 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-display font-bold text-slate-900">Worker Profile</h1>
        <button
          onClick={onEditProfile}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-[var(--primary-color)] cursor-pointer"
        >
          <Edit className="w-4 h-4" />
        </button>
      </header>
    );
  }

  if (isAdvances) {
    return (
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-5 h-16 flex items-center justify-between border-b border-slate-200/55">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-lg font-bold text-slate-900 flex-1 text-center pr-10">
          Advance Payments
        </h1>
      </header>
    );
  }

  const avatarUrl = '/admin%20image.png';

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 h-24 md:h-28 bg-white border-b border-slate-200 transition-colors shrink-0">
      <div className="flex items-center gap-4">
        <img src="/logo.png?v=3" alt="WorkTrack Pro Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl shadow-sm" />
        <div className="block">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">WorkTrack Pro</h1>
        </div>
      </div>

      <div className="relative" ref={profileRef}>
        <div 
          className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div className="text-right hidden md:block">
            <h1 className="text-xl md:text-2xl font-bold text-[#0f172a]">Mani</h1>
            <p className="text-lg font-bold text-[var(--primary-color)]">Supervisor</p>
          </div>
          <img
            alt="User Profile"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-200 object-cover hover:ring-4 hover:ring-[var(--primary-color)] transition-all shadow-md"
            style={{ objectPosition: 'center 20%' }}
            src={avatarUrl}
            referrerPolicy="no-referrer"
          />
        </div>

        {isProfileOpen && (
          <div className="absolute right-0 top-14 w-72 bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-5 mb-4">
              <div className="relative">
                <img src={avatarUrl} className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover ring-2 ring-indigo-50" style={{ objectPosition: 'center 20%' }} />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="text-center">
                <h3 className="font-black text-xl text-slate-900 tracking-tight">Mani</h3>
                <p className="text-xs text-[var(--primary-color)] font-bold uppercase tracking-widest mt-0.5">Supervisor</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-slate-500 font-medium">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span>Born</span>
                </div>
                <span className="font-bold text-slate-900">1982</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-slate-500 font-medium">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span>Age</span>
                </div>
                <span className="font-bold text-[var(--primary-color)] bg-indigo-50/80 px-2.5 py-1 rounded-md">{new Date().getFullYear() - 1982} Years</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-slate-500 font-medium">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>Contact</span>
                </div>
                <span className="font-bold text-slate-900">+91 98844 09329</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
