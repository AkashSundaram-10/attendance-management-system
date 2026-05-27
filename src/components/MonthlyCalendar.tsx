import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function MonthlyCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const resetToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = today.getDate() === i && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
    const isWeekend = new Date(currentDate.getFullYear(), currentDate.getMonth(), i).getDay() === 0;

    days.push(
      <div 
        key={`day-${i}`} 
        className={`flex items-center justify-center p-2 sm:p-3 text-lg md:text-xl rounded-xl transition-all cursor-default ${
          isToday 
            ? 'bg-[var(--primary-color)] text-white shadow-md shadow-[var(--primary-color)]/30 font-black scale-105' 
            : isWeekend 
              ? 'text-red-500 font-bold bg-red-50/50 hover:bg-red-50'
              : 'text-slate-700 font-semibold hover:bg-slate-100 hover:scale-105'
        }`}
      >
        {i}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 w-full">
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        
        <button 
          onClick={resetToToday}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors group"
        >
          <CalendarIcon className="w-5 h-5 text-[var(--primary-color)] group-hover:scale-110 transition-transform" />
          <h2 className="text-xl md:text-2xl font-black text-slate-900 font-display">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </button>

        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronRight className="w-6 h-6 text-slate-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2 md:gap-4 text-center mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-sm md:text-base font-bold text-slate-400 uppercase tracking-wider">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2 md:gap-4 text-center">
        {days}
      </div>
    </div>
  );
}
