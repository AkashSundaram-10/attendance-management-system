import { motion } from 'motion/react';
import { Users, UserCheck, IndianRupee, Wallet, MoreVertical, ArrowRight } from 'lucide-react';
import { AppView, Worker, AttendanceRecord, SalaryRecord } from '../types';
import { getCurrentPeriod } from '../api';

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

  const currentMonthStr = getCurrentPeriod().split(' | ')[0];
  const currentMonthSalaries = salaries.filter(s => s.period.startsWith(currentMonthStr) && workers.some(w => w.id === s.workerId));

  const totalSalaryProjected = currentMonthSalaries.reduce((acc, curr) => acc + curr.grossPay + curr.overtimePay, 0);
  const pendingSalaries = currentMonthSalaries.filter(s => s.status === 'Pending').reduce((acc, curr) => acc + curr.grossPay + curr.overtimePay - (curr.paidAmount || 0), 0);

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

  // Recent payments aggregated by worker for the current month
  const recentPaymentsList = workers.map(worker => {
    const workerSalaries = currentMonthSalaries.filter(s => s.workerId === worker.id);
    const totalGross = workerSalaries.reduce((acc, curr) => acc + curr.grossPay, 0);
    const totalOvertime = workerSalaries.reduce((acc, curr) => acc + curr.overtimePay, 0);
    const totalNetPay = totalGross + totalOvertime;
    const totalPaid = workerSalaries.reduce((acc, curr) => acc + (curr.paidAmount || (curr.status === 'Paid' ? (curr.grossPay + curr.overtimePay) : 0)), 0);
    
    // Status Logic
    let status = 'Pending';
    if (totalNetPay > 0 && totalPaid >= totalNetPay) status = 'Paid';
    else if (totalPaid > 0) status = 'Partial';

    // Find latest payment date
    const latestPayment = workerSalaries.find(s => s.disbursementDate)?.disbursementDate || '-';

    return {
      id: worker.id,
      workerName: worker.name,
      avatar: worker.avatar,
      role: worker.role,
      totalSalary: totalGross + totalOvertime,
      paid: totalPaid,
      balance: Math.max(0, totalNetPay - totalPaid),
      status,
      paymentDate: latestPayment,
    };
  }).filter(p => p.totalSalary > 0).slice(0, 4);
  // Dynamic Greeting
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 21 || hour < 5) greeting = 'Good night';

  // Dynamic Quotes
  const quotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "Great things are done by a series of small things brought together.",
    "Believe you can and you're halfway there.",
    "Quality is not an act, it is a habit.",
    "Opportunities don't happen. You create them.",
    "Do what you can, with what you have, where you are."
  ];
  const quoteOfDay = quotes[new Date().getDate() % quotes.length];

  let paidCount = 0;
  let partialCount = 0;
  let pendingCount = 0;

  workers.forEach(worker => {
    const workerSalaries = currentMonthSalaries.filter(s => s.workerId === worker.id);
    if (workerSalaries.length === 0) return;
    const totalGross = workerSalaries.reduce((acc, curr) => acc + curr.grossPay, 0);
    const totalOvertime = workerSalaries.reduce((acc, curr) => acc + curr.overtimePay, 0);
    const totalNetPay = totalGross + totalOvertime;
    const totalPaid = workerSalaries.reduce((acc, curr) => acc + (curr.paidAmount || (curr.status === 'Paid' ? (curr.grossPay + curr.overtimePay) : 0)), 0);

    if (totalNetPay > 0 && totalPaid >= totalNetPay) paidCount++;
    else if (totalPaid > 0) partialCount++;
    else pendingCount++;
  });

  const totalPaymentWorkers = paidCount + partialCount + pendingCount;
  const paidPct = totalPaymentWorkers > 0 ? Math.round((paidCount / totalPaymentWorkers) * 100) : 0;
  const partialPct = totalPaymentWorkers > 0 ? Math.round((partialCount / totalPaymentWorkers) * 100) : 0;
  const pendingPct = totalPaymentWorkers > 0 ? 100 - paidPct - partialPct : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-12 font-sans"
    >
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{greeting}, Mani!</h1>
        <p className="text-base text-slate-500 mt-1 italic">"{quoteOfDay}"</p>
      </div>

      {/* Statistic Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--primary-color)] flex items-center justify-center flex-shrink-0 text-white">
              <Users className="w-7 h-7" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[26px] font-bold text-slate-900 leading-tight">{totalWorkers}</div>
              <div className="text-base text-slate-500 font-medium leading-none">Total Workers</div>
            </div>
          </div>
          <button onClick={() => setView('workers')} className="text-base font-semibold text-[var(--primary-color)] hover:underline text-left mt-2">
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
              <div className="text-base text-slate-500 font-medium leading-none">Today Present</div>
            </div>
          </div>
          <button onClick={() => setView('attendance')} className="text-base font-semibold text-[var(--primary-color)] hover:underline text-left mt-2">
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
              <div className="text-base text-slate-500 font-medium leading-none">{`Total Salary (${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date())})`}</div>
            </div>
          </div>
          <button onClick={() => setView('salary')} className="text-base font-semibold text-[var(--primary-color)] hover:underline text-left mt-2">
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
              <div className="text-base text-slate-500 font-medium leading-none">Pending Payments</div>
            </div>
          </div>
          <button onClick={() => setView('salary')} className="text-base font-semibold text-[var(--primary-color)] hover:underline text-left mt-2">
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
              className="text-base font-semibold text-[var(--primary-color)] hover:underline flex items-center gap-1"
            >
              Mark Attendance <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y border-slate-100 text-base uppercase tracking-wider font-semibold text-slate-500">
                  <th className="px-5 py-3">Worker Name</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Check In</th>
                  <th className="px-5 py-3">Check Out</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="text-base">
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
                            <p className="font-semibold text-slate-900 text-lg">{worker.name}</p>
                            <p className="text-base text-slate-500">{worker.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-base font-semibold ${getBadgeStyle(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-lg text-slate-600 font-medium">{checkIn}</td>
                      <td className="px-5 py-3 text-lg text-slate-600 font-medium">{checkOut}</td>
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
              className="text-base font-semibold text-[var(--primary-color)] hover:underline flex items-center gap-1 ml-auto"
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
                <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="8" className="opacity-100" pathLength="100" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray={`${paidPct + partialPct} ${100 - (paidPct + partialPct)}`} strokeDashoffset="0" pathLength="100" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray={`${paidPct} ${100 - paidPct}`} strokeDashoffset="0" pathLength="100" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{totalPaymentWorkers}</span>
                <span className="text-base text-slate-500 font-medium">Total</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-base font-medium text-slate-700">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-lg">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  Paid
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-base">{paidCount}</span>
                  <span className="text-slate-400 text-base">({paidPct}%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-lg">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  Partial
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-base">{partialCount}</span>
                  <span className="text-slate-400 text-base">({partialPct}%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-lg">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  Pending
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-base">{pendingCount}</span>
                  <span className="text-slate-400 text-base">({pendingPct}%)</span>
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
            className="text-base font-semibold text-[var(--primary-color)] hover:underline flex items-center gap-1"
          >
            View all payments <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-slate-100 text-base uppercase tracking-wider font-semibold text-slate-500">
                <th className="px-5 py-3">Worker Name</th>
                <th className="px-5 py-3">Total Salary</th>

                <th className="px-5 py-3">Paid</th>
                <th className="px-5 py-3">Balance</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment Date</th>
              </tr>
            </thead>
            <tbody className="text-lg">
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

                    <td className="px-5 py-3 text-slate-600">{formatINR(payment.paid)}</td>
                    <td className="px-5 py-3 text-slate-600">{formatINR(payment.balance)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-base font-semibold ${getStatusStyle(payment.status)}`}>
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
