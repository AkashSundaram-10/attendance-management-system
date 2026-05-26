import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Download, ClipboardList, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Check, Clock, CheckCircle } from 'lucide-react';
import { Worker, SalaryRecord, AppView } from '../types';
import { getCurrentPeriod, getWeeksForMonthLabel, getAllMonthsForYear } from '../api';

interface SalaryViewProps {
  workers: Worker[];
  salaries: SalaryRecord[];
  onToggleSalaryStatus: (id: string, amount?: number, isRevert?: boolean) => void;
  onEditSalary: (workerId: string, grossPay: number, overtimePay: number, period?: string) => void;
  setView: (view: AppView) => void;
}

export default function SalaryView({ workers, salaries, onToggleSalaryStatus, onEditSalary, setView }: SalaryViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Paid'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const currentYear = parseInt(getCurrentPeriod().split(' ')[1], 10);
  const availableMonths = getAllMonthsForYear(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentPeriod().split(' | ')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editGrossPay, setEditGrossPay] = useState(0);
  const [editOvertimePay, setEditOvertimePay] = useState(0);

  // Calculate high-fidelity stats aggregates
  const currentSalaries = salaries.filter(s => s.period.startsWith(selectedMonth) && workers.some(w => w.id === s.workerId));
  
  // Get all weeks for the selected month, regardless of whether there are salaries
  const weeks = getWeeksForMonthLabel(selectedMonth);

  const totalProjected = currentSalaries.reduce((acc, curr) => acc + curr.grossPay + curr.overtimePay, 0);
  const totalDisbursed = currentSalaries
    .reduce((acc, curr) => acc + (curr.paidAmount || (curr.status === 'Paid' ? curr.grossPay + curr.overtimePay : 0)), 0);
  const totalPending = currentSalaries
    .filter((s) => s.status === 'Pending')
    .reduce((acc, curr) => acc + curr.grossPay + curr.overtimePay - (curr.paidAmount || 0), 0);

  const disbursedPct = totalProjected > 0 ? Math.round((totalDisbursed / totalProjected) * 100) : 0;

  // Search & Filter
  const filteredSalaries = currentSalaries.filter((s) => {
    const worker = workers.find((w) => w.id === s.workerId);
    if (!worker) return false;

    const matchesSearch =
      worker.name.toLowerCase().includes(search.toLowerCase()) ||
      worker.id.toLowerCase().includes(search.toLowerCase());

    if (filter === 'All') return matchesSearch;
    return matchesSearch && s.status === filter;
  });

  const toggleExpand = (workerId: string) => {
    if (expandedId === workerId) {
      setExpandedId(null);
    } else {
      setExpandedId(workerId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-20 select-none font-sans"
    >
      {/* Header Row */}
      <section className="flex justify-between items-end">
        <div className="w-full">
          <h2 className="text-2xl font-display font-black text-slate-800 tracking-tight">
            Salary Overview
          </h2>
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2 no-scrollbar w-full">
            {availableMonths.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-4 py-1.5 rounded-full text-base font-bold whitespace-nowrap transition-all ${
                  selectedMonth === m
                    ? 'bg-[var(--primary-color)] text-white shadow-md shadow-[var(--primary-color)]/20'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => alert('Demo Notice: Exporting ledger records as CSV/Sheets...')}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-base font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer select-none"
        >
          <Download className="w-4 h-4 text-slate-500" /> Export
        </button>
      </section>

      {/* Financial Bento Summary cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1 - Total Projected */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between h-[135px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50" />
          <div>
            <div className="flex items-center gap-1.5 text-slate-505 text-slate-500">
              <ClipboardList className="w-5 h-5 text-[var(--primary-color)]" />
              <span className="text-base font-semibold">Total Projected</span>
            </div>
            <div className="text-2xl font-black font-display text-slate-900 mt-2">
              ₹{totalProjected.toLocaleString()}
            </div>
          </div>
          <p className="text-base font-bold text-slate-400">
            +5.2% vs last month
          </p>
        </div>

        {/* Card 2 - Paid disbursed */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between h-[135px]">
          <div>
            <div className="flex items-center gap-1.5 text-slate-550 text-slate-500">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-base font-semibold">Disbursed (Paid)</span>
            </div>
            <div className="text-2xl font-black font-display text-slate-800 mt-2">
              ₹{totalDisbursed.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1 mt-auto">
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${disbursedPct}%` }}
              />
            </div>
            <p className="text-base font-bold text-slate-450 text-right">{disbursedPct}% Complete</p>
          </div>
        </div>

        {/* Card 3 - Pending */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between h-[135px]">
          <div>
            <div className="flex items-center gap-1.5 text-[#ba1a1a]">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-base font-semibold">Pending Clearance</span>
            </div>
            <div className="text-2xl font-black font-display text-slate-800 mt-2">
              ₹{totalPending.toLocaleString()}
            </div>
          </div>
          <span className="text-base font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full select-none self-start mt-2">
            Requires Approval
          </span>
        </div>
      </section>

      {/* Filters search and tabs block */}
      <section className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-medium focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all shadow-sm"
            placeholder="Search worker name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['All', 'Pending', 'Paid'] as const).map((t) => {
            const isSel = filter === t;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-xl text-base font-bold whitespace-nowrap border cursor-pointer ${isSel
                    ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-sm shadow-[var(--primary-color)]/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                {t === 'All' ? 'All Workers' : t === 'Pending' ? 'Pending Only' : 'Paid Only'}
              </button>
            );
          })}
        </div>
      </section>

      {/* Worker Salary lists cards container grouped by week */}
      <section className="space-y-8">
        {weeks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-base">
            No salary records match filters.
          </div>
        ) : (
          weeks.map(week => {
            const weekSalaries = filteredSalaries.filter(s => s.period === week).sort((a, b) => {
              const wA = workers.find(w => w.id === a.workerId);
              const wB = workers.find(w => w.id === b.workerId);
              return (wA?.name || '').localeCompare(wB?.name || '');
            });

            const weekProjected = weekSalaries.reduce((acc, curr) => acc + curr.grossPay + curr.overtimePay, 0);
            const weekDisbursed = weekSalaries.reduce((acc, curr) => acc + (curr.paidAmount || (curr.status === 'Paid' ? curr.grossPay + curr.overtimePay : 0)), 0);
            const weekPending = weekSalaries.filter((s) => s.status === 'Pending').reduce((acc, curr) => acc + curr.grossPay + curr.overtimePay - (curr.paidAmount || 0), 0);

            return (
              <div key={week} className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-lg font-black font-display text-slate-800">{week.includes(' | ') ? week.split(' | ')[1] : week}</h3>
                  <div className="flex items-center gap-4 text-base font-bold">
                    <span className="text-emerald-600">Paid: ₹{weekDisbursed.toLocaleString()}</span>
                    <span className="text-red-500">Unpaid: ₹{weekPending.toLocaleString()}</span>
                    <span className="text-slate-500">Total: ₹{weekProjected.toLocaleString()}</span>
                  </div>
                </div>
                {weekSalaries.length === 0 ? (
                  <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-base italic">
                    No records for this week
                  </div>
                ) : weekSalaries.map((s) => {
                  const worker = workers.find((w) => w.id === s.workerId);
                  if (!worker) return null;

            const isExpanded = expandedId === s.id;
            const netPay = s.grossPay + s.overtimePay;

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Main Card row trigger summaries clicks */}
                <div
                  onClick={() => toggleExpand(s.id as string)}
                  className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <img
                      alt={worker.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-100"
                      src={worker.avatar}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-base font-display font-bold text-slate-800">
                        {worker.name}
                      </h3>
                      <p className="text-base text-slate-500 font-medium">
                        {worker.role} • ID: {worker.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-6">
                    <div className="hidden md:block text-right">
                      <div className="text-base text-slate-400 font-bold uppercase tracking-wider">
                        Days
                      </div>
                      <div className="text-base font-bold text-slate-800">
                        {s.daysWorked}/{s.totalDays}
                      </div>
                    </div>



                    <div className="text-right">
                      <div className="text-lg font-display font-black text-slate-900">
                        ₹{netPay.toLocaleString()}
                      </div>
                      {s.status === 'Paid' ? (
                        <div className="text-base font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                          <Check className="w-3.5 h-3.5" /> {s.paidAmount && s.paidAmount < netPay ? `Paid ₹${s.paidAmount}` : 'Paid'} {s.disbursementDate || 'recently'}
                        </div>
                      ) : (
                        <div className="text-base font-bold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full inline-flex items-center justify-end gap-1 mt-1 font-sans">
                          {s.paidAmount && s.paidAmount > 0 ? `Partial (Paid ₹${s.paidAmount})` : 'Pending'}
                        </div>
                      )}
                    </div>

                    <p className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </p>
                  </div>
                </div>

                {/* Expandable detailed drawer breakdown */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-150 bg-slate-50 p-4 font-sans select-none"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-base">
                        <div>
                          <div className="text-slate-400 font-semibold mb-1">
                            Basic Salary ({Math.max(0, s.daysWorked - s.overtimeDays)} days)
                          </div>
                          {editingId === s.id ? (
                            <input 
                              type="number" 
                              step="1"
                              value={editGrossPay} 
                              onChange={(e) => setEditGrossPay(parseInt(e.target.value, 10) || 0)}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-base"
                            />
                          ) : (
                            <div className="font-bold text-slate-800">₹{s.grossPay}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-slate-400 font-semibold mb-1">Overtime ({s.overtimeDays} days)</div>
                          {editingId === s.id ? (
                            <input 
                              type="number" 
                              step="1"
                              value={editOvertimePay} 
                              onChange={(e) => setEditOvertimePay(parseInt(e.target.value, 10) || 0)}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-base"
                            />
                          ) : (
                            <div className="font-bold text-emerald-600">+₹{s.overtimePay}</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-slate-200/60 pt-3 flex justify-between items-center">
                        <div className="flex-1"></div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => alert(`Payslip generated for ${worker.name}. Saved to admin cloud reports.`)}
                            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-base rounded-lg transition-colors cursor-pointer select-none"
                          >
                            View Payslip
                          </button>

                          {editingId === s.id ? (
                            <button
                              onClick={() => {
                                onEditSalary(worker.id, editGrossPay, editOvertimePay, s.period);
                                setEditingId(null);
                              }}
                              className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-base rounded-lg transition-colors cursor-pointer select-none"
                            >
                              Save Edit
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(s.id as string);
                                setEditGrossPay(s.grossPay);
                                setEditOvertimePay(s.overtimePay);
                              }}
                              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-base rounded-lg transition-colors cursor-pointer select-none"
                            >
                              Edit Salary
                            </button>
                          )}

                          {s.status === 'Paid' ? (
                            <span
                              className="px-3 py-1.5 rounded-lg text-base font-bold cursor-pointer transition-all flex items-center gap-1 bg-slate-100 text-slate-800 hover:bg-slate-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleSalaryStatus(s.id as string, undefined, true);
                              }}
                            >
                              <Clock className="w-3.5 h-3.5" /> Revert to Pending
                            </span>
                          ) : (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {(s.paidAmount && s.paidAmount > 0) ? (
                                <span
                                  className="px-3 py-1.5 rounded-lg text-base font-bold cursor-pointer transition-all flex items-center gap-1 bg-slate-100 text-slate-800 hover:bg-slate-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSalaryStatus(s.id as string, undefined, true);
                                  }}
                                >
                                  <Clock className="w-3.5 h-3.5" /> Revert ₹{s.paidAmount}
                                </span>
                              ) : null}
                              <input
                                type="number"
                                className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-base focus:border-[var(--primary-color)] outline-none"
                                placeholder={`Max: ${netPay - (s.paidAmount || 0)}`}
                                id={`pay-${s.id}`}
                                defaultValue={netPay - (s.paidAmount || 0)}
                                step="1"
                              />
                              <span
                                className="px-3 py-1.5 rounded-lg text-base font-bold cursor-pointer transition-all flex items-center gap-1 bg-[var(--primary-color)] text-white hover:bg-[#6c61f2] shadow-md shadow-[var(--primary-color)]/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const el = document.getElementById(`pay-${s.id}`) as HTMLInputElement;
                                  let amount = netPay - (s.paidAmount || 0);
                                  if (el && el.value.trim() !== '') {
                                    const parsed = parseInt(el.value, 10);
                                    if (!isNaN(parsed)) amount = parsed;
                                  }
                                  onToggleSalaryStatus(s.id as string, amount, false);
                                }}
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
              </div>
            );
          })
        )}
      </section>
    </motion.div>
  );
}
