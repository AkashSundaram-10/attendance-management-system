import { motion } from 'motion/react';
import { Landmark } from 'lucide-react';

interface SplashViewProps {
  onComplete: () => void;
}

export default function SplashView({ onComplete }: SplashViewProps) {
  return (
    <div className="bg-[#131b2e] min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden text-white font-sans select-none">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#25005a]/30 blur-[120px]" />
      </div>

      {/* Main Content */}
      <main className="z-10 flex flex-col items-center justify-center flex-grow w-full px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-6 flex flex-col items-center"
        >
          <div 
            onClick={onComplete}
            className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500 ease-out cursor-pointer"
          >
            <Landmark className="text-[#4b41e1] w-12 h-12" />
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white mb-2">
            WorkTrack Pro
          </h1>
          <p className="text-lg text-indigo-200/80 max-w-xs mx-auto">
            Attendance &amp; Wage Management
          </p>
        </motion.div>
      </main>

      {/* Bottom Loading Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="z-10 absolute bottom-12 w-full flex flex-col items-center"
      >
        {/* Loading Dots */}
        <div className="flex space-x-2 mb-4">
          <span className="w-2.5 h-2.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 bg-indigo-350 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 bg-indigo-450 rounded-full animate-bounce" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Initializing Workspace
        </p>

        {/* Access Button bypass */}
        <button 
          onClick={onComplete}
          className="mt-4 px-4 py-1.5 rounded-full text-xs text-indigo-300 bg-indigo-900/40 border border-indigo-700/50 hover:bg-indigo-900/80 transition-all cursor-pointer"
        >
          Enter Dashboard
        </button>
      </motion.div>
    </div>
  );
}
