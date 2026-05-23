import { Bell, ArrowLeft, Edit } from 'lucide-react';
import { AppView } from '../types';

interface TopAppBarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onBack: () => void;
  onEditProfile?: () => void;
  notificationsCount: number;
  onClearNotifications: () => void;
}

export default function TopAppBar({
  currentView,
  setView,
  onBack,
  onEditProfile,
  notificationsCount,
  onClearNotifications,
}: TopAppBarProps) {
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
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-[#4b41e1] cursor-pointer"
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

  const avatarUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCCaDg4uI4Ij-5v8oYE3_GXBw8ALNgkEaRJfTs3l3EsE1ib-riUVWLidKH5Jss4r8N93ZwzzAsxNDejhZjn3rdUBjfWJcAsngJqxWSvlof1TlOn-cvRFH6AXgZ5L2Wzwddw_sz49THaGoHLfL4B28hvxQ0XLK3ex_NCMg6TfyI0MRhlZSiOUL0FtDgE1jfbdyLIgmLZofiLVcEv_8Dn0wckyUHAIuqC_574lU93LmYN6IKCXVRIs_6d0OT6M9N6etL4NDvevtL91ug';

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-8 h-20 bg-white border-b border-slate-200 transition-colors">
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <h1 className="text-sm font-bold text-[#0f172a]">Admin</h1>
          <p className="text-[11px] text-slate-500">Administrator</p>
        </div>
        <img
          alt="User Profile"
          className="w-10 h-10 rounded-full bg-slate-200 object-cover cursor-pointer hover:ring-2 hover:ring-[#4b41e1] transition-all"
          src={avatarUrl}
          referrerPolicy="no-referrer"
          onClick={() => setView('analytics')}
        />
      </div>
    </header>
  );
}
