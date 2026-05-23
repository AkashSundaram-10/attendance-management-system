import { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, Calendar, Coins, CheckCircle, ShieldAlert, Award } from 'lucide-react';
import { AppView, Worker, AttendanceRecord, SalaryRecord } from '../types';

interface WorkerProfileViewProps {
  worker: Worker;
  attendance: AttendanceRecord[];
  salaries: SalaryRecord[];
  setView: (view: AppView) => void;
  onNavigateToAdvances: () => void;
  onNavigateToSalaryApproval: () => void;
}

export default function WorkerProfileView({
  worker,
  attendance,
  salaries,
  setView,
  onNavigateToAdvances,
  onNavigateToSalaryApproval,
}: WorkerProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Attendance' | 'Salary' | 'Advance'>('Overview');

  // Compute stats for current worker from real live arrays
  const myAttendance = attendance.filter((a) => a.workerId === worker.id);
  const totalMyDaysCount = myAttendance.length;

  const presentDaysCount = myAttendance.filter(
    (a) => a.status === 'Present' || a.status === 'Overtime'
  ).length;

  const attendanceRate = totalMyDaysCount > 0 ? Math.round((presentDaysCount / totalMyDaysCount) * 100) : 96;
  const daysWorked = totalMyDaysCount > 0 ? presentDaysCount : 22;

  // Earnings
  const mySalary = salaries.find((s) => s.workerId === worker.id);
  const earningsValue = mySalary ? (mySalary.grossPay + mySalary.overtimePay - mySalary.advanceDeduction) : (daysWorked * worker.dailyWage);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-20 select-none font-sans"
    >
      {/* Profile Header Block */}
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <img
            alt={`${worker.name} Profile`}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            src={worker.avatar}
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#4b41e1] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">{worker.name}</h2>
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 mt-1 font-medium">
            {worker.role}
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            ID: {worker.id}
          </p>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e2dfff] text-[#0f0069] border border-[#c3c0ff]">
          <span className="w-2 h-2 rounded-full bg-[#4b41e1]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{worker.status}</span>
        </div>
      </section>

      {/* Analytics Summary Row Dashboard Bento-style */}
      <section className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-1">
            Attendance
          </span>
          <span className="text-base font-display font-black text-[#4b41e1]">{attendanceRate}%</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-1">
            Days Worked
          </span>
          <span className="text-base font-display font-black text-slate-800">{daysWorked}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-1">
            Earnings
          </span>
          <span className="text-base font-display font-black text-slate-800">
            ${earningsValue.toLocaleString()}
          </span>
        </div>
      </section>

      {/* Tabs list */}
      <section className="border-b border-slate-200">
        <div className="flex overflow-x-auto no-scrollbar pb-1 space-x-6">
          {(['Overview', 'Attendance', 'Salary', 'Advance'] as const).map((tab) => {
            const isTabActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'Advance') {
                    onNavigateToAdvances();
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className={`text-sm font-semibold pb-2.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${isTabActive
                    ? 'text-[#4b41e1] border-[#4b41e1]'
                    : 'text-slate-500 border-transparent hover:text-slate-800'
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </section>

      {/* Dynamic Tabs Content */}
      <section>
        {activeTab === 'Overview' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Worker Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                  <p className="text-xs font-bold text-slate-800">{worker.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                    {worker.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Joined Date</p>
                  <p className="text-xs font-bold text-slate-800">{worker.joinedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e2dfff] text-[#4b41e1] flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Daily Wage</p>
                  <p className="text-xs font-bold text-slate-850">${worker.dailyWage}.00 / day</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Attendance Register
              </h3>
              <span className="text-xs text-[#4b41e1] font-bold">{presentDaysCount} days present</span>
            </div>

            <div className="space-y-2.5">
              {myAttendance.length === 0 ? (
                <p className="text-xs text-slate-400">No attendance registered for this worker.</p>
              ) : (
                myAttendance.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-850">{rec.date}</p>
                      <p className="text-[10px] text-slate-450">
                        Check In: {rec.checkIn} | Check Out: {rec.checkOut}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rec.status === 'Present' || rec.status === 'Overtime'
                          ? 'bg-emerald-50 text-emerald-700'
                          : rec.status === 'Absent'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'Salary' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-[#7c839b] uppercase tracking-widest">
              Financial Compensation (October)
            </h3>

            {mySalary ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-450 uppercase font-semibold">Base pay</p>
                    <p className="font-bold text-slate-800">${mySalary.grossPay}.00</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-450 uppercase font-semibold">Bonus/Overtime</p>
                    <p className="font-bold text-emerald-600">+${mySalary.overtimePay}.00</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-450 uppercase font-semibold">Deduction</p>
                    <p className="font-bold text-red-650">-${mySalary.advanceDeduction}.00</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-450 uppercase font-semibold">Taxes</p>
                    <p className="font-bold text-red-650">-${mySalary.tax}.00</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400">Total Net Payout</p>
                    <p className="text-[#0f172a] font-display text-lg font-black">
                      ${(mySalary.grossPay + mySalary.overtimePay - mySalary.advanceDeduction - mySalary.tax).toLocaleString()}.00
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${mySalary.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800 hover:scale-105 transition-all cursor-pointer'
                      }`}
                    onClick={() => {
                      if (mySalary.status === 'Pending') {
                        onNavigateToSalaryApproval();
                      }
                    }}
                  >
                    {mySalary.status === 'Paid' ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Paid Oct 28
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Approve Approval
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-500 mb-2">No custom ledger created for this period.</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Comp estimate</p>
                  <p className="text-sm font-bold text-slate-800">
                    ${(daysWorked * worker.dailyWage).toLocaleString()}.00
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Calculated automatically from {daysWorked} days of approved attendance records.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </motion.div>
  );
}
