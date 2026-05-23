import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Calendar, DollarSign, Bolt, TrendingUp, BarChart3, Activity, PieChart, FileText, CheckCircle, ChevronDown, Check } from 'lucide-react';
import { AppView, Worker } from '../types';

interface AnalyticsViewProps {
  workers: Worker[];
  setView: (view: AppView) => void;
}

export default function AnalyticsView({ workers, setView }: AnalyticsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState('Oct 2023');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sparklines weekly attendance logs
  const weeklyAttendance = [
    { label: 'W1', value: 85 },
    { label: 'W2', value: 95 },
    { label: 'W3', value: 88 },
    { label: 'W4', value: 92 },
    { label: 'W5', value: 98 },
  ];

  const handleExport = () => {
    setToastMessage('Preparing CSV, Attendance Sheets and Audit logs. Export download started!');
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const categories = [
    { title: 'Attendance Reports', icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Salary Sheets', icon: FileText, color: 'bg-indigo-50 text-[#4b41e1]' },
    { title: 'Worker Performance', icon: Activity, color: 'bg-indigo-50 text-[#4b41e1]' },
    { title: 'Operational Costs', icon: PieChart, color: 'bg-[#eaddff] text-[#25005a]' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-24 select-none font-sans"
    >
      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 z-50 bg-[#131b2e] text-white p-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-indigo-500/20 text-xs font-semibold"
          >
            <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3px]" />
            </div>
            <p className="flex-1 text-slate-100">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Month Filter Row */}
      <section className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-black text-[#0f172a] leading-tight">
            Reports &amp; Analytics
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Monthly Overview</p>
        </div>

        <div className="relative">
          <button className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer select-none">
            {selectedMonth} <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </section>

      {/* Overview Bento Sections grid */}
      <section className="grid grid-cols-2 gap-4">
        {/* Total Expenses full-width */}
        <div className="col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#4b41e1] opacity-5 rounded-full blur-xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-650 flex items-center justify-center">
                <DollarSign className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            </div>
            <span className="bg-slate-50 text-red-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 border border-slate-200">
              <TrendingUp className="w-3 h-3" /> +4.2%
            </span>
          </div>

          <h3 className="text-3xl font-display font-black text-slate-900 leading-none">$142,500</h3>
        </div>

        {/* Average Attendance */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] flex flex-col justify-between h-[125px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500 truncate">Avg Attendance</span>
          </div>
          <div className="mt-auto">
            <h3 className="text-xl font-display font-black text-slate-800 mb-1 leading-none">94%</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#4b41e1] h-full rounded-full" style={{ width: '94%' }} />
            </div>
          </div>
        </div>

        {/* Efficiency Score */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] flex flex-col justify-between h-[125px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
              <Bolt className="w-4 h-4 text-[#4b41e1]" />
            </div>
            <span className="text-xs font-semibold text-slate-500 truncate">Efficiency Score</span>
          </div>
          <div className="mt-auto">
            <h3 className="text-xl font-display font-black text-slate-800 mb-1 leading-none">A-</h3>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wide">
              Top 15% regional
            </span>
          </div>
        </div>
      </section>

      {/* SVG Custom Charts Container */}
      <section className="space-y-4">
        {/* Attendance Trends */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-display font-bold text-slate-850 text-sm tracking-wide">
              Attendance Trends
            </h3>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active log</span>
          </div>

          {/* Bar columns */}
          <div className="h-40 w-full relative flex items-end gap-1.5 pt-4">
            {/* Grid background lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              <div className="border-t border-slate-100 w-full border-dashed" />
              <div className="border-t border-slate-100 w-full border-dashed" />
              <div className="border-t border-slate-100 w-full border-dashed" />
            </div>

            {/* Simulated bars with inline React hover hooks */}
            <div className="w-full h-full flex items-end justify-between z-10 pb-6 pt-2 select-none">
              {weeklyAttendance.map((bar, idx) => {
                const isHovered = hoveredBar === idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="w-1/6 flex flex-col items-center relative group select-none cursor-pointer"
                  >
                    {/* Tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: -10 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none select-none z-50 whitespace-nowrap"
                        >
                          {bar.value}% Present
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Column Pillar */}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        idx === 1 || isHovered ? 'bg-[#4b41e1] h-[85%]' : 'bg-slate-200 h-[65%]'
                      }`}
                      style={{ height: `${bar.value}%` }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block font-sans">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Salary Distribution chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-850 text-sm tracking-wide mb-1">
              Salary Distribution
            </h3>
            <p className="text-xs text-slate-450 font-bold mb-4">Total: $124.5k</p>

            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4b41e1]" /> Base Pay (70%)
              </li>
              <li className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c3c0ff]" /> Overtime (20%)
              </li>
              <li className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Bonuses (10%)
              </li>
            </ul>
          </div>

          {/* svg circle donut chart */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Base track (Bonuses 10%) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="4"
                strokeDasharray="10 90"
                strokeDashoffset="0"
              />
              {/* Overtime track (20%) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#c3c0ff"
                strokeWidth="4"
                strokeDasharray="20 80"
                strokeDashoffset="-10"
              />
              {/* Base Pay track (70%) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#4b41e1"
                strokeWidth="4"
                strokeDasharray="70 30"
                strokeDashoffset="-30"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">Breakdown</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Report Categories */}
      <section>
        <h3 className="font-display font-bold text-[#0f172a] text-sm mb-3.5">
          Report Categories
        </h3>
        <div className="grid grid-cols-2 gap-3 pb-8">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                onClick={handleExport}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3.5 hover:bg-slate-50 hover:border-[#4b41e1] hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer shadow-sm select-none"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 stroke-[2.2px]" />
                </div>
                <span className="text-xs font-bold text-[#0f172a] leading-tight font-display">
                  {cat.title}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Export FAB pin */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={handleExport}
          className="bg-[#4b41e1] hover:bg-[#6c61f2] text-white h-14 px-6 rounded-full shadow-[0px_8px_20px_rgba(75,65,225,0.25)] flex items-center gap-2 active:scale-95 transition-all text-xs font-bold font-display uppercase tracking-wide cursor-pointer"
        >
          <Download className="w-4.5 h-4.5" /> Export Data
        </button>
      </div>
    </motion.div>
  );
}
