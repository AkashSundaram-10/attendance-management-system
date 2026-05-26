import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MoreVertical, Plus, X, UserCheck, ShieldClose } from 'lucide-react';
import { AppView, Worker } from '../types';

interface WorkersViewProps {
  workers: Worker[];
  setView: (view: AppView) => void;
  setSelectedWorkerId: (id: string) => void;
  onAddWorker: (worker: Omit<Worker, 'id' | 'joinedDate'>) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  onEditWorker: (id: string, updatedWorker: Partial<Worker>) => void;
  onDeleteWorker: (id: string) => void;
}

export default function WorkersView({
  workers,
  setView,
  setSelectedWorkerId,
  onAddWorker,
  isAddModalOpen,
  setIsAddModalOpen,
  onEditWorker,
  onDeleteWorker,
}: WorkersViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'On Leave' | 'Disabled'>('All');

  // Add Worker Form state
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('General Labourer');
  const [newWorkerWage, setNewWorkerWage] = useState(1000);
  const [newWorkerPhone, setNewWorkerPhone] = useState('+1 (555) ');

  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerStatus, setNewWorkerStatus] = useState<'Active' | 'On Leave'>('Active');

  // Filtered workers list
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.role.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && w.status === statusFilter;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) return;

    // Use a default avatar fallback
    const mockAvatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCoP1Mliv7KX-Uj93-9wrT4rnnVnL9pEKyhWSBCX2zp_qlOa76tfB4uI_vz6IEsS1J208dmpClEU6bgwZkeHnGYSoSyrG_mJxgDA_abx5Q1DW0fGZjURljOG7OD4Ar2ANhjFHkzmifQkTrze6PIMFxzY-aFJYX1VaZG1JSByRUsoDoGegxEhD7kKeMuSwXG2BFuOaI94aI6ZM-fAWUFsJH2BHbMOQmhpqxfUN3i_Hi5SW-W_KTGoiF6gfQ22n2qBe9eab5GNbIe0nQ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDu73Yr6-ihN5TGdybMMSd1BK9Esjg1X8JpRKXF2sjKYmozXBhCbUxS1LkfYXFj0YCSOdlwYTFM-rlpiMG2zUErnu1ZxPz6EMLa2q3dMHLT--ovNdeL17rdpVeCZMzoX811p96InQZ8KpJG6r0ahXv3zdknn8pbJcYu8pALDTFxJisV0VmBMmxsB8rLQymTh3sHy1_pmPb_5jbBuLmIp20WW_zrrsbIhsLu6g4vaapcqgCgEZ4K9C8GIKyzEMKT0AUwig_gKSBpcGM',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuATzmD88vsc7HsV26DSmy-C5lTieN90k6xuPSOSfho57wyP7NeHpA_UBxR77VDQpHXtqkqU1NJhFInJ6ZKfAsoy_YKJ66ODcP6kKLc0fqwtGjjib7VN0yb3cRbeXDdPYm5yJY3sWJnFkc89sue22QU2lk0sKqpLharlBuxX0w62oGbB8S4oHdufUWgEH-NZf1EjMkPTcr3OlfJzCgMbdeqTmSQ9ET2jzozP2A6cwZeTwT5PqzAF9Uncsj1GtOpM1xs33jmGdAaRFNg'
    ];
    const chosenAvatar = mockAvatars[Math.floor(Math.random() * mockAvatars.length)];

    onAddWorker({
      name: newWorkerName,
      role: newWorkerRole,
      avatar: chosenAvatar,
      status: newWorkerStatus as 'Active' | 'On Leave',
      phone: newWorkerPhone,
      email: newWorkerEmail || `${newWorkerName.toLowerCase().replace(/\s+/g, '')}@site.com`,
      dailyWage: newWorkerWage,
    });

    // Clear form
    setNewWorkerName('');
    setNewWorkerRole('General Labourer');
    setNewWorkerWage(1000);
    setNewWorkerPhone('+1 (555) ');
    setNewWorkerEmail('');
    setIsAddModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-20 select-none font-sans"
    >
      {/* Search & Filters */}
      <section className="flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <input
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[var(--primary-color)] text-base placeholder-slate-400 shadow-sm"
            placeholder="Search workers..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['All', 'Active', 'On Leave', 'Disabled'] as const).map((filter) => {
            const isSelected = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-base font-semibold whitespace-nowrap transition-all border cursor-pointer ${isSelected
                    ? 'bg-[#131b2e] text-white border-[#131b2e] shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </section>

      {/* Workers Cards List */}
      <section className="flex flex-col gap-4">
        {filteredWorkers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-base">
            No workers matches the selection filters.
          </div>
        ) : (
          filteredWorkers.map((w) => {
            const isOnLeave = w.status === 'On Leave';
            const isDisabled = w.status === 'Disabled';

            return (
              <article
                key={w.id}
                onClick={() => {
                  setSelectedWorkerId(w.id);
                  setView('worker-profile');
                }}
                className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-slate-200 cursor-pointer hover:border-[var(--primary-color)] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <img
                    alt={w.name}
                    className={`w-12 h-12 rounded-full object-cover border-2 border-slate-100 ${isOnLeave ? 'grayscale' : ''
                      }`}
                    src={w.avatar}
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col">
                    <h2 className="text-base font-display font-bold text-slate-800 group-hover:text-[var(--primary-color)] transition-colors leading-snug">
                      {w.name}
                    </h2>
                    <span className="text-base text-[#7c839b]">{w.role}</span>
                    <span className="text-base font-bold text-[var(--primary-color)] mt-1">
                      ₹{w.dailyWage} / day
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1.5">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedWorkerId(w.id);
                        setView('worker-profile');
                      }}
                      className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-colors cursor-pointer text-base font-semibold"
                    >
                      View
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingWorker(w); }}
                      className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors cursor-pointer text-base font-semibold"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteWorker(w.id); }}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer text-base font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-base font-bold ${isDisabled
                        ? 'bg-red-50 text-red-650'
                        : isOnLeave
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                  >
                    {w.status}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[var(--primary-color)] hover:bg-[#645efb] text-white px-8 py-4 rounded-full shadow-[0px_8px_20px_rgba(75,65,225,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 z-40 whitespace-nowrap"
        title="Add New Worker"
      >
        <span className="text-lg font-bold">Add Worker</span>
        <Plus className="w-6 h-6 stroke-[3px]" />
      </button>

      {/* Add Worker Dialog Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="bg-[#131b2e] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-display font-bold text-lg">Register New Worker</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full text-[#7c839b] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-base font-bold text-slate-500">FullName</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Miller"
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-base font-bold text-slate-500">Role / Trade</label>
                    <select
                      value={newWorkerRole}
                      onChange={(e) => setNewWorkerRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                    >
                      <option value="Electrician">Electrician</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="General Labourer">General Labourer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-base font-bold text-slate-500">Daily Wage (₹)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={newWorkerWage}
                      onChange={(e) => setNewWorkerWage(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-base font-bold text-slate-500">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newWorkerPhone}
                    onChange={(e) => setNewWorkerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-base font-bold text-slate-500">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. jmiller@site.com"
                      value={newWorkerEmail}
                      onChange={(e) => setNewWorkerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-base font-bold text-slate-500">Status</label>
                    <select
                      value={newWorkerStatus}
                      onChange={(e) => setNewWorkerStatus(e.target.value as 'Active' | 'On Leave')}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-base rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[var(--primary-color)] hover:bg-[#6c61f2] text-white font-bold text-base rounded-xl shadow-lg shadow-[var(--primary-color)]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" /> Add Recruit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Worker Dialog Modal */}
      <AnimatePresence>
        {editingWorker && (
          <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="bg-[var(--primary-color)] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-display font-bold text-lg">Edit Worker</h3>
                <button
                  onClick={() => setEditingWorker(null)}
                  className="p-1 rounded-full text-indigo-200 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                onEditWorker(editingWorker.id, editingWorker);
                setEditingWorker(null);
              }} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-base font-bold text-slate-500">FullName</label>
                  <input
                    type="text"
                    required
                    value={editingWorker.name}
                    onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-base font-bold text-slate-500">Role / Trade</label>
                    <select
                      value={editingWorker.role}
                      onChange={(e) => setEditingWorker({ ...editingWorker, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                    >
                      <option value="Electrician">Electrician</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="General Labourer">General Labourer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-base font-bold text-slate-500">Daily Wage (₹)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={editingWorker.dailyWage}
                      onChange={(e) => setEditingWorker({ ...editingWorker, dailyWage: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-base font-bold text-slate-500">Phone</label>
                  <input
                    type="tel"
                    required
                    value={editingWorker.phone}
                    onChange={(e) => setEditingWorker({ ...editingWorker, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-base font-bold text-slate-500">Email (Optional)</label>
                    <input
                      type="email"
                      value={editingWorker.email}
                      onChange={(e) => setEditingWorker({ ...editingWorker, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-base font-bold text-slate-500">Status</label>
                    <select
                      value={editingWorker.status}
                      onChange={(e) => setEditingWorker({ ...editingWorker, status: e.target.value as 'Active' | 'On Leave' | 'Disabled' })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-[var(--primary-color)]"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingWorker(null)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-base rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[var(--primary-color)] hover:bg-[#6c61f2] text-white font-bold text-base rounded-xl shadow-lg shadow-[var(--primary-color)]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Save Changes
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
