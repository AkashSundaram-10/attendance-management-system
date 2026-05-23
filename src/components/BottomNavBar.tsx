import { LayoutDashboard, Users, CalendarCheck2, BadgeDollarSign, BarChart3 } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavBarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export default function BottomNavBar({ currentView, setView }: BottomNavBarProps) {
  // Map layouts to their active category
  const getIsActive = (tab: 'dashboard' | 'workers' | 'attendance' | 'salary' | 'reports') => {
    switch (tab) {
      case 'dashboard':
        return currentView === 'dashboard';
      case 'workers':
        return currentView === 'workers' || currentView === 'worker-profile';
      case 'attendance':
        return currentView === 'attendance';
      case 'salary':
        return currentView === 'salary' || currentView === 'advance-payments';
      case 'reports':
        return currentView === 'analytics';
      default:
        return false;
    }
  };

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      targetView: 'dashboard' as AppView,
    },
    {
      id: 'workers' as const,
      label: 'Workers',
      icon: Users,
      targetView: 'workers' as AppView,
    },
    {
      id: 'attendance' as const,
      label: 'Attendance',
      icon: CalendarCheck2,
      targetView: 'attendance' as AppView,
    },
    {
      id: 'salary' as const,
      label: 'Salary',
      icon: BadgeDollarSign,
      targetView: 'salary' as AppView,
    },
    {
      id: 'reports' as const,
      label: 'Reports',
      icon: BarChart3,
      targetView: 'analytics' as AppView,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-1.5 py-3 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(15,23,42,0.05)] rounded-t-2xl">
      {navItems.map((item) => {
        const isActive = getIsActive(item.id);
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => setView(item.targetView)}
            className={`flex flex-col items-center justify-center transition-all duration-200 py-1.5 cursor-pointer select-none ${
              isActive
                ? 'text-[#4b41e1] font-bold bg-[#dae2fd] rounded-full px-5 scale-95'
                : 'text-slate-500 text-[#45464d] px-3'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
