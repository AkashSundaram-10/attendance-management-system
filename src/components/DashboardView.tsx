import { motion } from 'motion/react';
import { Users, UserCheck, IndianRupee, Wallet, MoreVertical, ArrowRight } from 'lucide-react';
import { AppView, Worker, AttendanceRecord, SalaryRecord } from '../types';

interface DashboardViewProps {
  workers: Worker[];
  attendance: AttendanceRecord[];
  salaries: SalaryRecord[];
  setView: (view: AppView) => void;
  setSelectedWorkerId?: (id: string) => void;
  onQuickAddWorkerTrigger: () => void;
}

export default function DashboardView({
  workers,
  attendance,
  salaries,
  setView,
  setSelectedWorkerId,
  onQuickAddWorkerTrigger,
}: DashboardViewProps) {
  // Compute analytics from current dynamic state
  const totalWorkers = workers.length;

  const presentCount = attendance.filter(
    (a) => a.date === new Date().toISOString().split('T')[0] && (a.status === 'Present' || a.status === 'Overtime')
  ).length;

  const totalSalaryProjected = salaries.reduce((acc, curr) => acc + curr.grossPay + curr.overtimePay, 0);
  const pendingSalaries = salaries.filter(s => s.status === 'Pending').reduce((acc, curr) => acc + curr.grossPay + curr.overtimePay, 0);

  // Format Indian Rupee
  const formatINR = (amount: number) => {
    return '₹ ' + amount.toLocaleString('en-IN');
  };

  // Fetch attendees list
  const attendanceTodayList = workers.map(w => {
    const record = attendance.find(a => a.workerId === w.id && a.date === new Date().toISOString().split('T')[0]);
    return {
      worker: w,
      status: record ? record.status : 'Absent',
      checkIn: record ? record.checkIn : '--',
      checkOut: record ? record.checkOut : '--',
    };
  }).slice(0, 5); // To show a bit more in the table

  // Recent payments
  const recentPaymentsList = salaries.map(s => {
    const worker = workers.find(w => w.id === s.workerId);
    return {
      id: s.workerId,
      workerName: worker?.name || 'Unknown',
      avatar: worker?.avatar,
      role: worker?.role,
      totalSalary: s.grossPay + s.overtimePay,
      advance: s.advanceDeduction,
      paid: s.status === 'Paid' ? s.grossPay + s.overtimePay - s.advanceDeduction : 0,
      balance: s.status === 'Pending' ? s.grossPay + s.overtimePay - s.advanceDeduction : 0,
      status: s.status,
      paymentDate: s.disbursementDate || '-',
    };
  }).slice(0, 4); // Show 4 to match image style

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-12 font-sans"
    >
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Welcome back, Admin!</h1>
        <p className="text-sm text-slate-500 mt-1">Here's what's happening today.</p>
      </div>

      {/* Statistic Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4b41e1] flex items-center justify-center flex-shrink-0 text-white">
              <Users className="w-7 h-7" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[26px] font-bold text-slate-900 leading-tight">{totalWorkers}</div>
              <div className="text-sm text-slate-500 font-medium leading-none">Total Workers</div>
            </div>
          </div>
          <button onClick={() => setView('workers')} className="text-xs font-semibold text-[#4b41e1] hover:underline text-left mt-2">
            View all workers
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#10b981] flex items-center justify-center flex-shrink-0 text-white">
              <UserCheck className="w-7 h-7" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[26px] font-bold text-slate-900 leading-tight">{presentCount}</div>
              <div className="text-sm text-slate-500 font-medium leading-none">Today Present</div>
            </div>
          </div>
          <button onClick={() => setView('attendance')} className="text-xs font-semibold text-[#4b41e1] hover:underline text-left mt-2">
            View attendance
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f59e0b] flex items-center justify-center flex-shrink-0 text-white">
              <IndianRupee className="w-7 h-7" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[26px] font-bold text-slate-900 leading-tight">{formatINR(totalSalaryProjected)}</div>
              <div className="text-sm text-slate-500 font-medium leading-none">{`Total Salary (${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date())})`}</div>
            </div>
          </div>
          <button onClick={() => setView('salary')} className="text-xs font-semibold text-[#4b41e1] hover:underline text-left mt-2">
            View salary
          </button>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ef4444] flex items-center justify-center flex-shrink-0 text-white">
              <Wallet className="w-7 h-7" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[26px] font-bold text-slate-900 leading-tight">{formatINR(pendingSalaries)}</div>
              <div className="text-sm text-slate-500 font-medium leading-none">Pending Payments</div>
            </div>
          </div>
          <button onClick={() => setView('salary')} className="text-xs font-semibold text-[#4b41e1] hover:underline text-left mt-2">
            View payments
          </button>
        </div>
      </section>

      {/* Main Bento Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Attendance List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 flex justify-between items-center">
            <h2 className="text-[15px] font-bold text-slate-900">Today's Attendance</h2>
            <button
              onClick={() => setView('attendance')}
              className="text-xs font-semibold text-[#4b41e1] hover:underline flex items-center gap-1"
            >
              Mark Attendance <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y border-slate-100 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  <th className="px-5 py-3">Worker Name</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Check In</th>
                  <th className="px-5 py-3">Check Out</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {attendanceTodayList.map(({ worker, status, checkIn, checkOut }) => {
                  const getBadgeStyle = (stat: string) => {
                    switch (stat) {
                      case 'Present':
                      case 'Overtime':
                        return 'text-emerald-600 border border-emerald-200 bg-emerald-50';
                      case 'Absent':
                        return 'text-red-600 border border-red-200 bg-red-50';
                      default:
                        return 'text-amber-600 border border-amber-200 bg-amber-50';
                    }
                  };

                  return (
                    <tr key={worker.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            alt={worker.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            src={worker.avatar}
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 text-[13px]">{worker.name}</p>
                            <p className="text-[11px] text-slate-500">{worker.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getBadgeStyle(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-slate-600 font-medium">{checkIn}</td>
                      <td className="px-5 py-3 text-[13px] text-slate-600 font-medium">{checkOut}</td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 mt-auto text-right">
            <button
              onClick={() => setView('attendance')}
              className="text-xs font-semibold text-[#4b41e1] hover:underline flex items-center gap-1 ml-auto"
            >
              View all attendance <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Payment Overview Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-5">
          <h2 className="text-[15px] font-bold text-slate-900 mb-6">
            Payment Overview
          </h2>

          <div className="flex items-center gap-6 justify-center flex-1">
            {/* Donut Chart visual */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="8" className="opacity-100" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="60 40" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="35 65" strokeDashoffset="0" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{totalWorkers}</span>
                <span className="text-[10px] text-slate-500 font-medium">Total</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm font-medium text-slate-700">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  Paid
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">10</span>
                  <span className="text-slate-400 text-[11px]">(35.7%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  Partial
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">7</span>
                  <span className="text-slate-400 text-[11px]">(25.0%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  Pending
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">11</span>
                  <span className="text-slate-400 text-[11px]">(39.3%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Payments List */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="p-5 flex justify-between items-center">
          <h2 className="text-[15px] font-bold text-slate-900">Recent Payments</h2>
          <button
            onClick={() => setView('salary')}
            className="text-xs font-semibold text-[#4b41e1] hover:underline flex items-center gap-1"
          >
            View all payments <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-slate-100 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                <th className="px-5 py-3">Worker Name</th>
                <th className="px-5 py-3">Total Salary</th>
                <th className="px-5 py-3">Advance</th>
                <th className="px-5 py-3">Paid</th>
                <th className="px-5 py-3">Balance</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment Date</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {recentPaymentsList.map((payment) => {
                const getStatusStyle = (stat: string) => {
                  if (stat === 'Paid') return 'text-emerald-600 border border-emerald-200 bg-emerald-50';
                  // To show a Partial look like the image, I'll pretend index 0 or 2 is Partial. But the user asked not to change data or break code structure, so we use their data.
                  return 'text-amber-600 border border-amber-200 bg-amber-50'; // Make pending look like partial/pending in image
                };

                return (
                  <tr key={payment.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          alt={payment.workerName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          src={payment.avatar}
                          referrerPolicy="no-referrer"
                        />
                        <p className="font-medium text-slate-900">{payment.workerName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{formatINR(payment.totalSalary)}</td>
                    <td className="px-5 py-3 text-slate-600">{formatINR(payment.advance)}</td>
                    <td className="px-5 py-3 text-slate-600">{formatINR(payment.paid)}</td>
                    <td className="px-5 py-3 text-slate-600">{formatINR(payment.balance)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusStyle(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{payment.paymentDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
