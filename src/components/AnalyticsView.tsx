import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Worker, SalaryRecord, AttendanceRecord } from '../types';
import { Download, Users, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, BarChart2, IndianRupee, Info, Check, X } from 'lucide-react';

interface AnalyticsViewProps {
  workers: Worker[];
  salaries: SalaryRecord[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (workerId: string, status: 'Present' | 'Absent' | 'Overtime', checkInTimeStr?: string, checkOutTimeStr?: string, targetDateStr?: string) => void;
}

export default function AnalyticsView({ workers, salaries, attendance, onUpdateAttendance }: AnalyticsViewProps) {
  // Setup Month selection
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11

  // Month navigation helpers
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  // Generate exactly 28 days starting from the FIRST Monday of the selected month
  const { daysArray, weeks } = useMemo(() => {
    let firstMonday = 1;
    while (new Date(selectedYear, selectedMonth, firstMonday).getDay() !== 1) {
      firstMonday++;
    }

    const arr = [];
    const startDayObj = new Date(selectedYear, selectedMonth, firstMonday);
    
    for (let i = 0; i < 28; i++) {
      const d = new Date(startDayObj);
      d.setDate(startDayObj.getDate() + i);
      arr.push({
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dateObj: d
      });
    }

    const wks = [
      arr.slice(0, 7),
      arr.slice(7, 14),
      arr.slice(14, 21),
      arr.slice(21, 28)
    ];

    return { daysArray: arr, weeks: wks };
  }, [selectedMonth, selectedYear]);

  // Calculate Data for the Table
  const tableData = useMemo(() => {
    let totalPresentCount = 0;
    let totalAbsentCount = 0;
    let totalOvertimeCount = 0;
    let overallTotalSalary = 0;
    let overallDaysWorked = 0;

    const selectedMonthName = new Date(selectedYear, selectedMonth, 1).toLocaleString('en-US', { month: 'long' });
    const selectedMonthStr = `${selectedMonthName} ${selectedYear}`;
    const currentMonthSalaries = salaries.filter(s => s.period.startsWith(selectedMonthStr));

    const rows = workers.map(worker => {
      const dayMarks: Record<string, 'Present' | 'Absent' | 'Overtime' | null> = {};
      let daysWorked = 0;
      
      for (const dObj of daysArray) {
        const record = attendance.find(a => a.workerId === worker.id && a.date.startsWith(dObj.dateStr));
        if (record) {
          dayMarks[dObj.dateStr] = record.status;
          if (record.status === 'Present') {
            daysWorked += 1;
            totalPresentCount++;
          }
          else if (record.status === 'Overtime') {
            daysWorked += 1; 
            totalOvertimeCount++;
            totalPresentCount++; 
          }
          else if (record.status === 'Absent') {
            totalAbsentCount++;
          }
        } else {
          dayMarks[dObj.dateStr] = null;
        }
      }

      overallDaysWorked += daysWorked;
      
      const workerSalaries = currentMonthSalaries.filter(s => s.workerId === worker.id);
      let totalAmount = 0;
      if (workerSalaries.length > 0) {
        totalAmount = workerSalaries.reduce((acc, curr) => acc + curr.grossPay + curr.overtimePay, 0);
      } else {
        const otDays = Object.values(dayMarks).filter(s => s === 'Overtime').length;
        const presentDays = daysWorked - otDays;
        totalAmount = (presentDays * worker.dailyWage) + (otDays * 1500);  
      }
      
      overallTotalSalary += totalAmount;

      return {
        worker,
        dayMarks,
        daysWorked,
        otDays: Object.values(dayMarks).filter(s => s === 'Overtime').length,
        totalAmount
      };
    });

    // Calculate Top KPI logic based on rows
    const totalWorkers = workers.length;
    const totalStatusCount = totalPresentCount + totalAbsentCount;
    const presentPct = totalStatusCount > 0 ? Math.round((totalPresentCount / totalStatusCount) * 100) : 0;
    const absentPct = totalStatusCount > 0 ? Math.round((totalAbsentCount / totalStatusCount) * 100) : 0;

    // Average Attendance
    const totalPossibleDays = totalWorkers * 28; // strictly 28 days matrix
    const averageAttendance = totalPossibleDays > 0 ? ((overallDaysWorked / totalPossibleDays) * 100).toFixed(1) : '0';

    return {
      rows,
      topKPI: {
        totalWorkers,
        present: totalPresentCount,
        presentPct,
        absent: totalAbsentCount,
        absentPct,
        overtime: totalOvertimeCount
      },
      bottomKPI: {
        overallDaysWorked,
        overallOvertime: totalOvertimeCount,
        averageAttendance,
        overallTotalSalary
      }
    };
  }, [workers, attendance, daysArray]);

  const getStatusIcon = (status: string | null, dateStr: string) => {
    if (status === 'Present') return <Check className="w-5 h-5 text-emerald-500 stroke-[4]" />;
    if (status === 'Overtime') return <span className="text-xs font-black text-indigo-600">OT</span>;
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr > todayStr) {
      return <span className="text-slate-300 text-lg">-</span>;
    }
    
    // Default to Absent (X) instead of dash for past/today
    return <X className="w-5 h-5 text-red-500 stroke-[4]" />;
  };

  const exportToExcel = () => {
    const headers = ['No.', 'Worker Name', ...daysArray.map(d => `${d.dateObj.getDate()} ${new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d.dateObj)}`), 'Days Worked', 'Total Amount'];
    
    const csvRows = [];
    csvRows.push(headers.join(','));

    const todayStr = new Date().toISOString().split('T')[0];

    tableData.rows.forEach((row, idx) => {
      const rowData = [
        idx + 1,
        `"${row.worker.name}"`
      ];

      daysArray.forEach(d => {
        const status = row.dayMarks[d.dateStr];
        let val = '';
        if (status === 'Present') val = 'P';
        else if (status === 'Overtime') val = 'OT';
        else if (d.dateStr > todayStr) val = '-';
        else val = 'A';
        rowData.push(val);
      });

      rowData.push(row.daysWorked);
      rowData.push(row.totalAmount);
      csvRows.push(rowData.join(','));
    });

    const footerData = ['Total', ''];
    daysArray.forEach(() => footerData.push(''));
    footerData.push(tableData.bottomKPI.overallDaysWorked);
    footerData.push(tableData.bottomKPI.overallTotalSalary);
    csvRows.push(footerData.join(','));

    const csvString = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleString('en-US', { month: 'long' });
    a.setAttribute('download', `Analytics_${monthName}_${selectedYear}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-20 select-none font-sans"
    >
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-display font-black text-[#1e293b] leading-tight">
            Weekly Attendance
          </h2>
          <p className="text-sm text-slate-500 font-medium">View weekly wise attendance of all workers in a month</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <select 
              value={selectedMonth} 
              onChange={handleMonthChange}
              className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString('en', { month: 'short' })}
                </option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={handleYearChange}
              className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </section>

      {/* Top KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Workers</div>
            <div className="text-xl font-black text-slate-800">{tableData.topKPI.totalWorkers}</div>
          </div>
        </div>
        <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Present</div>
            <div className="text-xl font-black text-slate-800">
              {tableData.topKPI.present} <span className="text-xs text-emerald-600 font-bold">({tableData.topKPI.presentPct}%)</span>
            </div>
          </div>
        </div>
        <div className="bg-[#fef2f2] border border-[#fee2e2] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Absent</div>
            <div className="text-xl font-black text-slate-800">
              {tableData.topKPI.absent} <span className="text-xs text-red-600 font-bold">({tableData.topKPI.absentPct}%)</span>
            </div>
          </div>
        </div>
        <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white font-black text-sm">
            OT
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Overtime</div>
            <div className="text-xl font-black text-slate-800">
              {tableData.topKPI.overtime} <span className="text-xs text-slate-500 font-medium">Days</span>
            </div>
          </div>
        </div>
      </section>

      {/* Attendance Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            {/* Week Groupings Header */}
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-4 font-semibold text-sm text-slate-800 border-r border-slate-200 w-12 text-center sticky left-0 bg-slate-50 z-20" rowSpan={2}>No.</th>
              <th className="px-5 py-4 font-semibold text-sm text-slate-800 border-r border-slate-200 min-w-[220px] sticky left-[48px] bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" rowSpan={2}>Worker Name</th>
              
              {weeks.map((weekDays, idx) => {
                const firstDay = weekDays[0];
                const lastDay = weekDays[weekDays.length - 1];
                return (
                  <th key={idx} className="py-3 font-bold text-sm text-slate-800 border-r border-slate-200 text-center" colSpan={7}>
                    Week {idx + 1} <div className="text-[11px] text-slate-500 font-medium mt-0.5">({firstDay.day} {new Date(0, firstDay.month).toLocaleString('en', { month: 'short' })} - {lastDay.day} {new Date(0, lastDay.month).toLocaleString('en', { month: 'short' })})</div>
                  </th>
                )
              })}
              
              <th className="px-4 py-4 font-semibold text-sm text-slate-800 border-r border-slate-200 text-center leading-tight" rowSpan={2}>Days<br/>Worked</th>
              <th className="px-4 py-4 font-semibold text-sm text-slate-800 text-center leading-tight" rowSpan={2}>Total<br/>Amount</th>
            </tr>
            {/* Days Header */}
            <tr className="border-b border-slate-200 bg-white">
              {daysArray.map((dObj, idx) => {
                const isWeekend = dObj.dateObj.getDay() === 0;
                const dayName = dObj.dateObj.toLocaleString('en-US', { weekday: 'short' });
                return (
                  <th key={dObj.dateStr} className={`py-2 min-w-[38px] font-semibold text-center border-r ${isWeekend ? 'bg-red-50/50 text-red-500' : 'text-slate-600'} ${idx === 6 || idx === 13 || idx === 20 || idx === 27 ? 'border-r-slate-200' : 'border-slate-100'}`}>
                    <div className="text-sm">{dObj.day}</div>
                    <div className="text-[9px] font-bold opacity-60 uppercase tracking-tighter -mt-0.5">{dayName}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, index) => (
              <tr key={row.worker.id} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-2 text-sm font-medium text-slate-500 text-center border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50 z-10 transition-colors">{index + 1}</td>
                <td className="py-4 px-5 text-sm font-bold text-slate-800 border-r border-slate-100 whitespace-nowrap sticky left-[48px] bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">{row.worker.name}</td>
                
                {daysArray.map((dObj, idx) => (
                  <td 
                    key={dObj.dateStr} 
                    className={`p-1.5 border-r text-center transition-colors ${idx === 6 || idx === 13 || idx === 20 || idx === 27 ? 'border-r-slate-200' : 'border-slate-100'}`}
                  >
                    <div className="w-8 h-8 mx-auto flex items-center justify-center rounded">
                      {getStatusIcon(row.dayMarks[dObj.dateStr], dObj.dateStr)}
                    </div>
                  </td>
                ))}
                
                <td className="py-4 px-4 text-sm font-bold text-slate-700 text-center border-r border-slate-100">{row.daysWorked}</td>
                <td className="py-4 px-4 text-sm font-black text-slate-900 text-center">₹{row.totalAmount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-6 px-2 text-xs font-bold text-slate-600">
        <span>Legend:</span>
        <div className="flex items-center gap-2 text-emerald-600"><Check className="w-4 h-4 stroke-[3]" /> Present</div>
        <div className="flex items-center gap-2 text-red-600"><X className="w-4 h-4 stroke-[3]" /> Absent</div>
        <div className="flex items-center gap-2 text-indigo-600">OT Overtime</div>
      </div>

      {/* Bottom KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-5 flex items-center gap-4">
          <div className="text-emerald-600">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Days Worked</div>
            <div className="text-xl font-black text-slate-800">
              {tableData.bottomKPI.overallDaysWorked} <span className="text-sm text-slate-500 font-medium">Days</span>
            </div>
          </div>
        </div>
        <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white font-black shrink-0">
            OT
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Overtime Days</div>
            <div className="text-xl font-black text-slate-800">
              {tableData.bottomKPI.overallOvertime} <span className="text-sm text-slate-500 font-medium">Days</span>
            </div>
          </div>
        </div>
        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-5 flex items-center gap-4">
          <div className="text-amber-500">
            <BarChart2 className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Average Attendance</div>
            <div className="text-xl font-black text-slate-800">
              {tableData.bottomKPI.averageAttendance}%
            </div>
          </div>
        </div>
        <div className="bg-[#f5f3ff] border border-[#ede9fe] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Salary</div>
            <div className="text-xl font-black text-indigo-700">
              ₹{tableData.bottomKPI.overallTotalSalary.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
