import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { api } from '../api';

interface DeletedWorkersViewProps {
  onRestore?: () => void;
  requestSecureAction?: (action: () => void) => void;
}

export default function DeletedWorkersView({ onRestore, requestSecureAction }: DeletedWorkersViewProps) {
  const [deletedWorkers, setDeletedWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeleted();
  }, []);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const data = await api.getDeletedWorkers();
      setDeletedWorkers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await api.restoreWorker(id);
      fetchDeleted();
      onRestore?.();
    } catch (err) {
      alert('Failed to restore worker');
    }
  };

  const handleHardDelete = (id: string) => {
    const doDelete = async () => {
      try {
        await api.hardDeleteWorker(id);
        fetchDeleted();
      } catch (err) {
        alert('Failed to permanently delete worker');
      }
    };

    if (requestSecureAction) {
      requestSecureAction(doDelete);
    } else {
      doDelete();
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading deleted workers...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-12 font-sans"
    >
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-red-500" /> Deleted Workers
        </h1>
        <p className="text-sm text-slate-500 mt-1">Workers deleted will be permanently removed after 25 days.</p>
      </div>

      {deletedWorkers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Trash2 className="w-12 h-12 text-slate-300 mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Recycle Bin Empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            There are currently no deleted workers awaiting permanent removal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deletedWorkers.map(w => {
            // Calculate totals
            let totalPaid = 0;
            let totalUnpaid = 0;
            
            w.salaries?.forEach((s: any) => {
              const netPay = s.finalSalary || 0;
              const paid = s.payments?.reduce((acc: number, curr: any) => acc + curr.amountPaid, 0) || 0;
              totalPaid += paid;
              if (netPay > paid) {
                totalUnpaid += (netPay - paid);
              }
            });

            const deletedDate = new Date(w.updatedAt);
            const daysSinceDeleted = Math.floor((new Date().getTime() - deletedDate.getTime()) / (1000 * 3600 * 24));
            const daysLeft = 25 - daysSinceDeleted;

            return (
              <div key={w.id} className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden relative group">
                <div className="h-1 bg-red-500 absolute top-0 left-0 right-0" />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900">{w.fullName}</h3>
                      <p className="text-xs text-slate-500">Code: {w.workerCode}</p>
                    </div>
                    <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold border border-red-100 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {daysLeft} days left
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-3 mb-4 border border-slate-100">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Paid Salary</p>
                      <p className="font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Unpaid Dues</p>
                      <p className="font-bold text-red-600">₹{totalUnpaid.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestore(w.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Restore
                    </button>
                    <button
                      onClick={() => handleHardDelete(w.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
