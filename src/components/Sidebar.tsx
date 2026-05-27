import { LayoutDashboard, Users, CalendarCheck2, BadgeDollarSign, CreditCard, PieChart, Settings, FileText } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentView, setView }: SidebarProps) {
  const getIsActive = (tab: AppView) => {
    if (tab === 'workers' && currentView === 'worker-profile') return true;
    if (tab === 'salary' && currentView === 'advance-payments') return true;
    return currentView === tab;
  };

  const navItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workers' as AppView, label: 'Workers', icon: Users },
    { id: 'attendance' as AppView, label: 'Attendance', icon: CalendarCheck2 },
    { id: 'salary' as AppView, label: 'Salary', icon: BadgeDollarSign },
    { id: 'analytics' as AppView, label: 'Analytics', icon: PieChart },
    { id: 'deleted-workers' as AppView, label: 'Recycle Bin', icon: FileText },
  ];

  return (
    <nav className="w-full bg-[#111827] text-white flex items-center justify-center overflow-x-auto no-scrollbar shadow-md z-40 sticky top-20 shrink-0">
      <div className="flex px-2 py-2 space-x-1 min-w-max">
        {navItems.map((item, index) => {
          const isActive = getIsActive(item.id);
          const Icon = item.icon;

          return (
            <button
              key={`${item.id}-${index}`}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-lg md:text-xl font-semibold rounded-xl transition-colors shrink-0 ${isActive
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
