import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X } from 'lucide-react';

interface PinPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PinPromptModal({ isOpen, onClose, onSuccess }: PinPromptModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1982') {
      setPin('');
      setError(false);
      onSuccess();
      onClose();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-[320px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200"
          >
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-6 py-8 flex flex-col items-center justify-center relative shadow-inner">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors cursor-pointer"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-lg border border-white/20 mb-3"
              >
                <Lock className="w-8 h-8 text-white drop-shadow-md" />
              </motion.div>
              <h2 className="text-white font-black font-display tracking-widest text-lg drop-shadow-sm">VERIFICATION</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <p className="text-xs text-slate-500 text-center font-bold">Please enter the master PIN to continue.</p>
                <input
                  type="password"
                  autoFocus
                  required
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(false);
                  }}
                  className={`w-full text-center tracking-[1em] font-mono text-[22px] py-3 rounded-xl border-2 transition-all outline-none ${error ? 'border-red-500 text-red-500 bg-red-50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-indigo-100 focus:border-indigo-500 text-slate-800 bg-white shadow-inner focus:shadow-[0_0_15px_rgba(99,102,241,0.2)]'}`}
                  placeholder="****"
                  maxLength={4}
                />
                {error && <p className="text-[10px] uppercase font-bold tracking-wider text-red-500 text-center animate-pulse">Incorrect PIN. Try again.</p>}
                
                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-[#4b41e1] text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer mt-2"
                >
                  Verify Now
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
