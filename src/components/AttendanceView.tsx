import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, ArrowUpDown, Check, X, Clock, HelpCircle, Activity, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar as CalendarIcon } from 'lucide-react';
import { Worker, AttendanceRecord } from '../types';

interface AttendanceViewProps {
  workers: Worker[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (workerId: string, status: 'Present' | 'Absent' | 'Overtime') => void;
}

export default function AttendanceView({
  workers,
  attendance,
  onUpdateAttendance,
}: AttendanceViewProps) {
  const today = new Date();
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Calendar generation logic
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8 md:w-10 md:h-10" />);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === today.toISOString().split('T')[0];
      
      days.push(
        <button
          key={dateStr}
          onClick={() => setSelectedDate(dateStr)}
          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer ${
            isSelected 
              ? 'bg-[#4b41e1] text-white shadow-md shadow-[#4b41e1]/25 scale-100' 
              : isToday 
                ? 'bg-slate-100 text-[#4b41e1] border border-slate-200 font-bold hover:bg-slate-200' 
                : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm w-full lg:max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentMonth(new Date(year - 1, month, 1))} 
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer transition-colors"
              title="Previous Year"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} 
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          
          <div className="font-bold font-display text-slate-800 text-lg flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#4b41e1]" />
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth)}
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} 
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date(year + 1, month, 1))} 
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer transition-colors"
              title="Next Year"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 place-items-center">
          {days}
        </div>
      </div>
    );
  };

  // Compute stats for current selected date
  const myAttendance = attendance.filter((a) => a.date === selectedDate);
  const presentCount = myAttendance.filter((a) => a.status === 'Present').length;
  const absentCount = myAttendance.filter((a) => a.status === 'Absent').length;
  const overtimeCount = myAttendance.filter((a) => a.status === 'Overtime').length;

  // Filter workers based on input search
  const filteredWorkers = workers.filter((w) => {
    return (
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.role.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-20 select-none font-sans"
    >
      {/* Date Header Title */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-display font-black text-slate-900 leading-tight">
              Daily Attendance
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(selectedDate))}
            </p>
          </div>
        </div>

        {/* Interactive Calendar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {renderCalendar()}
          
          {/* Summary Cards Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 flex-grow content-start">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center gap-1.5 text-slate-500 pb-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">Present</span>
              </div>
              <div className="text-2xl font-black font-display text-slate-800">{presentCount || 0}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center gap-1.5 text-slate-500 pb-2">
                <X className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold">Absent</span>
              </div>
              <div className="text-2xl font-black font-display text-slate-800">{absentCount || 0}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[110px] col-span-2 lg:col-span-2 xl:col-span-1">
              <div className="flex items-center gap-1.5 text-slate-500 pb-2">
                <Activity className="w-4 h-4 text-[#4b41e1]" />
                <span className="text-xs font-semibold">Overtime</span>
              </div>
              <div className="text-2xl font-black font-display text-slate-800">{overtimeCount || 0}</div>
            </div>
          </div>
        </div>


      </section>

      {/* Search & Filter bar row */}
      <section className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium text-slate-850 focus:outline-none focus:border-[#4b41e1] shadow-sm"
            placeholder="Search workers by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
          />
        </div>
        <button className="bg-white border border-slate-200 px-3.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" /> Filter
        </button>
      </section>

      {/* Workers Attendance cards log list */}
      <section className="space-y-4">
        {filteredWorkers.map((w) => {
          // Look up attendance record for this worker and selections
          const record = myAttendance.find((a) => a.workerId === w.id);

          // Render active record styling badges
          const getBadgeType = (st: string) => {
            switch (st) {
              case 'Present':
                return { text: 'Present', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
              case 'Absent':
                return { text: 'Absent', color: 'bg-red-50 text-red-750 border-red-100' };
              case 'Overtime':
                return { text: 'Overtime', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' };
              default:
                return { text: 'Unmarked', color: 'bg-slate-50 text-slate-500 border-slate-100 border-dashed' };
            }
          };

          const badge = getBadgeType(record ? record.status : '');

          return (
            <div
              key={w.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-50/50"
            >
              {/* Profile section info */}
              <div className="flex items-center gap-3">
                <img
                  alt={w.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-100"
                  src={w.avatar}
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-sm font-display font-bold text-slate-800 group-hover:text-[#4b41e1]">
                    {w.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{w.role}</p>
                </div>
              </div>

              {/* Check in timers */}
              <div className="flex items-center gap-6 bg-slate-50 p-2.5 rounded-xl md:bg-transparent md:p-0">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#798097]">
                    Check In
                  </span>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {record ? record.checkIn : '--:--'}
                  </span>
                </div>
                <div className="w-px h-6 bg-slate-250 hidden md:block" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#798097]">
                    Check Out
                  </span>
                  <span className="text-xs font-bold text-slate-850 leading-tight">
                    {record ? record.checkOut : '--:--'}
                  </span>
                </div>
              </div>

              {/* Status Badge overlays & manual Actions triggers */}
              {record ? (
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-50 ${badge.color}`}
                    onClick={() => {
                      // Cycle attendance statuses on badge clicks for high convenience!
                      const nextStat =
                        record.status === 'Present'
                          ? 'Absent'
                          : record.status === 'Absent'
                            ? 'Overtime'
                            : 'Present';
                      onUpdateAttendance(w.id, nextStat);
                    }}
                  >
                    {record.status === 'Present' && <Check className="w-3.5 h-3.5" />}
                    {record.status === 'Absent' && <X className="w-3.5 h-3.5" />}
                    {badge.text}
                  </span>
                </div>
              ) : (
                /* Unrecorded staff ghost indicators */
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => onUpdateAttendance(w.id, 'Present')}
                    className="flex-1 md:flex-none px-3 py-1.5 rounded-lg border border-slate-350 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-350 text-slate-500 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Present
                  </button>
                  <button
                    onClick={() => onUpdateAttendance(w.id, 'Absent')}
                    className="flex-1 md:flex-none px-3 py-1.5 rounded-lg border border-slate-350 hover:bg-red-50 hover:text-red-700 hover:border-red-350 text-slate-500 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" /> Absent
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </motion.div>
  );
}
