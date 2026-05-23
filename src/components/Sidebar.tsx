import { LayoutDashboard, Users, CalendarCheck2, BadgeDollarSign, CreditCard, PieChart, Settings, FileText } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
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
    { id: 'advance-payments' as AppView, label: 'Advances', icon: CreditCard },
    { id: 'salary' as AppView, label: 'Payments', icon: FileText }, // Reusing salary view for payments
    { id: 'analytics' as AppView, label: 'Reports', icon: PieChart },
    { id: 'dashboard' as AppView, label: 'Settings', icon: Settings }, // Dummy for now
  ];

  return (
    <aside className="w-64 bg-[#111827] text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#4b41e1] rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">WorkTrack Pro</h1>
          <p className="text-[10px] text-slate-400">Attendance & Wage Management</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = getIsActive(item.id);
          const Icon = item.icon;
          
          return (
            <button
              key={`${item.id}-${index}`}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                isActive 
                  ? 'bg-[#4b41e1] text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Mini Calendar Widget */}
      <div className="p-4 mt-auto">
        <div className="bg-[#1f2937] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium">
            <CalendarCheck2 className="w-4 h-4 text-slate-400" />
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 mb-2 font-medium">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-white">
            {Array.from({ length: 42 }, (_, i) => {
               const d = new Date();
               const today = d.getDate();
               d.setDate(1);
               const startDay = d.getDay();
               const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
               const cellNum = i - startDay + 1;
               if (cellNum < 1 || cellNum > daysInMonth) return <div key={i}></div>;
               const isToday = cellNum === today;
               return (
                 <div key={i} className={isToday ? "bg-[#4b41e1] text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto" : "flex items-center justify-center h-6"}>
                   {cellNum}
                 </div>
               );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
