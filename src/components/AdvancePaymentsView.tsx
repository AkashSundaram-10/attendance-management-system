import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, SlidersHorizontal, RefreshCw, CheckCircle, TrendingUp, X, UserCheck, AlertOctagon } from 'lucide-react';
import { Worker, AdvancePayment, AppView } from '../types';

interface AdvancePaymentsViewProps {
  workers: Worker[];
  advances: AdvancePayment[];
  onAddAdvance: (advance: Omit<AdvancePayment, 'id' | 'requestedDate' | 'balance'>) => void;
  onUpdateAdvanceStatus: (id: string, status: 'Given' | 'Recovered') => void;
  setView: (view: AppView) => void;
}

export default function AdvancePaymentsView({
  workers,
  advances,
  onAddAdvance,
  onUpdateAdvanceStatus,
  setView,
}: AdvancePaymentsViewProps) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [amount, setAmount] = useState(200);

  // Totals calculations
  const totalAdvances = advances.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = advances
    .filter((a) => a.status === 'Given')
    .reduce((acc, curr) => acc + curr.balance, 0);
  const totalRecovered = totalAdvances - totalPending;

  const pendingPct = totalAdvances > 0 ? Math.round((totalPending / totalAdvances) * 100) : 34;
  const recoveredPct = totalAdvances > 0 ? Math.round((totalRecovered / totalAdvances) * 100) : 66;

  // Filter advances
  const filteredAdvances = advances.filter((a) => {
    return (
      a.workerName.toLowerCase().includes(search.toLowerCase()) ||
      a.workerId.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) {
      alert('Please select a valid worker name.');
      return;
    }

    onAddAdvance({
      workerId: worker.id,
      workerName: worker.name,
      workerAvatar: worker.avatar,
      amount: amount,
      status: 'Given',
    });

    // Reset Form
    setSelectedWorkerId('');
    setAmount(200);
    setIsAddOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-24 select-none font-sans"
    >
      {/* Summary Bento Row */}
      <section className="grid grid-cols-2 gap-4">
        {/* Total Advances */}
        <div className="col-span-2 bg-[#4b41e1] text-white rounded-2xl p-5 shadow-lg shadow-indigo-600/20 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-[10px] font-bold text-indigo-150 uppercase tracking-widest opacity-80">
              Total Advances
            </span>
            <h2 className="text-3xl font-black font-display mt-1">
              ₹{totalAdvances.toLocaleString()}.00
            </h2>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-white text-xs select-none">
            <span className="bg-white/20 p-1.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold">+8.4% from last month</span>
          </div>
        </div>

        {/* Pending Recovery */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} /> Given Advances
          </span>
          <span className="text-lg font-black font-display text-slate-800">
            ₹{totalPending.toLocaleString()}.00
          </span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-auto">
            <div
              className="bg-[#0f172a] h-1.5 rounded-full transition-all"
              style={{ width: `${pendingPct}%` }}
            />
          </div>
        </div>

        {/* Recovered */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Recovered
          </span>
          <span className="text-lg font-black font-display text-slate-850">
            ₹{totalRecovered.toLocaleString()}.00
          </span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-auto">
            <div
              className="bg-[#4b41e1] h-1.5 rounded-full transition-all"
              style={{ width: `${recoveredPct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Search and Filters row */}
      <section className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#4b41e1] transition-all placeholder:text-slate-400 shadow-sm"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
          />
        </div>
        <button className="bg-white border border-slate-200 rounded-xl px-3.5 flex items-center justify-center text-[#0f172a] shadow-sm hover:bg-slate-50 cursor-pointer">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
        </button>
      </section>

      {/* Transaction List */}
      <section className="flex flex-col gap-4">
        <h3 className="font-display font-black text-slate-800 text-sm tracking-wide">
          Recent Transactions
        </h3>

        {filteredAdvances.map((adv) => {
          const isPending = adv.status === 'Given';
          const isRecovered = adv.status === 'Recovered';

          return (
            <div
              key={adv.id}
              className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5 transition-all ${
                isRecovered ? 'opacity-70 grayscale-20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    alt={adv.workerName}
                    className={`w-10 h-10 rounded-full object-cover border border-slate-200 ${
                      isRecovered ? 'grayscale' : ''
                    }`}
                    src={adv.workerAvatar}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-display font-bold text-slate-850 xs:text-sm">
                      {adv.workerName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      ID: {adv.workerId}
                    </p>
                  </div>
                </div>

                {/* Status Toggle on click triggers for demo capability! */}
                <span
                  onClick={() => {
                    // Click to cycle status for testing conveniency
                    const nextSt =
                      adv.status === 'Given'
                        ? 'Recovered'
                        : 'Given';
                    onUpdateAdvanceStatus(adv.id, nextSt);
                  }}
                  className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide cursor-pointer transition-all ${
                    isPending
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : isRecovered
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  }`}
                  title="Click to toggle status"
                >
                  {adv.status}
                </span>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide leading-none">
                    Advance Amount
                  </span>
                  <span className={`text-base font-display font-black text-slate-900 mt-1 ${isRecovered ? 'line-through opacity-50' : ''}`}>
                    ₹{adv.amount.toLocaleString()}.00
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-600">
                    Bal: ₹{adv.balance.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5">
                    {adv.requestedDate}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* FAB button */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-24 right-5 bg-[#4b41e1] hover:bg-[#6c61f2] text-white px-5 py-3.5 rounded-xl shadow-[0px_8px_20px_rgba(75,65,225,0.25)] flex items-center gap-2 active:scale-95 transition-all z-40 text-xs font-bold font-display tracking-wide cursor-pointer"
      >
        <Plus className="w-5 h-5 stroke-[2.5px]" /> Give Advance
      </button>

      {/* Add Advance Request Dialog Modal Overlay */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-[#000000]/35 backdrop-blur-sm flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 font-sans p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-1.5 p-1">
                  <AlertOctagon className="w-5 h-5 text-[#4b41e1]" /> Give Advance
                </h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Choose Worker
                  </label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4b41e1]"
                  >
                    <option value="">Select a worker...</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Advance Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    max={1500}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 leading-normal p-1">
                    Advance payments are deducted automatically on the next salary release cycle. Limit ₹1,500.
                  </p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#4b41e1] hover:bg-[#6c61f2] text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <UserCheck className="w-4 h-4" /> Give Advance
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
