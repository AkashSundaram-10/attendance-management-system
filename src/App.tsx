import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppView, Worker, AttendanceRecord, SalaryRecord, AdvancePayment } from './types';
import {
  INITIAL_WORKERS,
  INITIAL_ATTENDANCE,
  INITIAL_SALARY_RECORDS,
  INITIAL_ADVANCES,
} from './initialData';

// Subcomponents
import SplashView from './components/SplashView';
import LoginView from './components/LoginView';
import TopAppBar from './components/TopAppBar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import WorkersView from './components/WorkersView';
import WorkerProfileView from './components/WorkerProfileView';
import AttendanceView from './components/AttendanceView';
import SalaryView from './components/SalaryView';
import AdvancePaymentsView from './components/AdvancePaymentsView';
import AnalyticsView from './components/AnalyticsView';

export default function App() {
  // App views state machines
  const [currentView, setView] = useState<AppView>('splash');
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [salaries, setSalaries] = useState<SalaryRecord[]>(INITIAL_SALARY_RECORDS);
  const [advances, setAdvances] = useState<AdvancePayment[]>(INITIAL_ADVANCES);

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('WTP-4921'); // Default Marcus
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(1);

  // Quick helper to fetch selected worker
  const activeWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];

  // Callback to add a new worker
  const handleAddWorker = (newWorker: Omit<Worker, 'id' | 'joinedDate'>) => {
    const nextIdNum = Math.floor(Math.random() * 8000) + 1000;
    const isWTP = Math.random() > 0.5;
    const generatedId = `${isWTP ? 'WTP' : 'WRK'}-${nextIdNum}`;

    const dateToday = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const joinedDateStr = `${months[dateToday.getMonth()]} ${String(dateToday.getDate()).padStart(2, '0')}, ${dateToday.getFullYear()}`;

    const recruit: Worker = {
      id: generatedId,
      joinedDate: joinedDateStr,
      ...newWorker,
    };

    setWorkers((prev) => [recruit, ...prev]);

    // Create automatic blank salary record for October 2023 Period
    const mockSalary: SalaryRecord = {
      workerId: recruit.id,
      period: `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`,
      daysWorked: 22,
      totalDays: 22,
      grossPay: 22 * recruit.dailyWage,
      overtimePay: 0,
      advanceDeduction: 0,
      tax: Math.round(22 * recruit.dailyWage * 0.08),
      status: 'Pending',
    };
    setSalaries((prev) => [mockSalary, ...prev]);

    // Push notification alert
    setNotificationsCount((c) => c + 1);
  };

  // Callback to toggle/mark labor attendance
  const handleUpdateAttendance = (
    workerId: string,
    status: 'Present' | 'Absent' | 'Overtime'
  ) => {
    setAttendance((prev) => {
      const todayDate = new Date().toISOString().split('T')[0];
      const existingIdx = prev.findIndex((a) => a.workerId === workerId && a.date === todayDate);

      const checkInTime = status === 'Present' || status === 'Overtime' ? '08:00 AM' : '--:--';
      const checkOutTime = status === 'Overtime' ? '07:30 PM' : status === 'Present' ? '05:00 PM' : '--:--';

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          checkIn: checkInTime,
          checkOut: checkOutTime,
        };
        return updated;
      } else {
        const record: AttendanceRecord = {
          workerId,
          date: todayDate,
          status,
          checkIn: checkInTime,
          checkOut: checkOutTime,
        };
        return [...prev, record];
      }
    });

    // Update active salary days count dynamically in response to attendance clicks!
    setSalaries((prev) => {
      return prev.map((s) => {
        const currentPeriod = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`;
        if (s.workerId === workerId && s.period === currentPeriod) {
          const isMarkedIn = status === 'Present' || status === 'Overtime';
          const increment = isMarkedIn ? 1 : -1;
          const wageValue = 1000;

          const updatedDays = Math.max(0, Math.min(22, s.daysWorked + increment));
          const updatedGross = updatedDays * wageValue;

          return {
            ...s,
            daysWorked: updatedDays,
            grossPay: updatedGross,
            overtimePay: status === 'Overtime' ? s.overtimePay + 1500 : s.overtimePay,
          };
        }
        return s;
      });
    });
  };

  // Callback to edit salary
  const handleEditSalary = (workerId: string, grossPay: number, overtimePay: number) => {
    setSalaries((prev) => {
      return prev.map((s) => {
        const currentPeriod = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`;
        if (s.workerId === workerId && s.period === currentPeriod) {
          return {
            ...s,
            grossPay,
            overtimePay,
          };
        }
        return s;
      });
    });
  };


  // Callback to approve individual pending salary rollouts
  const handleApproveSalary = (workerId: string) => {
    setSalaries((prev) => {
      return prev.map((s) => {
        const currentPeriod = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`;
        if (s.workerId === workerId && s.period === currentPeriod) {
          return {
            ...s,
            status: 'Paid',
            disbursementDate: `${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date())} 28`,
          };
        }
        return s;
      });
    });

    // Automatically recover Outstanding Advances if the worker had approved advances and got salary disbursements!
    setAdvances((prev) => {
      return prev.map((adv) => {
        if (adv.workerId === workerId && adv.status === 'Approved') {
          return {
            ...adv,
            balance: 0,
            status: 'Recovered',
          };
        }
        return adv;
      });
    });
  };

  // Callback to register Advance Requests
  const handleAddAdvance = (
    newAdvance: Omit<AdvancePayment, 'id' | 'requestedDate' | 'balance'>
  ) => {
    const nextAdvNum = Math.floor(Math.random() * 9000) + 1000;
    const entry: AdvancePayment = {
      id: `ADV-${nextAdvNum}`,
      requestedDate: 'Requested Oct 26',
      balance: newAdvance.amount,
      ...newAdvance,
    };

    setAdvances((prev) => [entry, ...prev]);

    // Update active salary state so deduction registers automatically on next rollout!
    setSalaries((prev) => {
      return prev.map((s) => {
        const currentPeriod = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`;
        if (s.workerId === newAdvance.workerId && s.period === currentPeriod) {
          return {
            ...s,
            advanceDeduction: s.advanceDeduction + newAdvance.amount,
          };
        }
        return s;
      });
    });
  };

  // Change individual Advance status
  const handleUpdateAdvanceStatus = (
    id: string,
    status: 'Approved' | 'Pending' | 'Recovered'
  ) => {
    setAdvances((prev) => {
      return prev.map((adv) => {
        if (adv.id === id) {
          const isRec = status === 'Recovered';
          return {
            ...adv,
            status,
            balance: isRec ? 0 : adv.amount,
          };
        }
        return adv;
      });
    });
  };

  // Check if shell layout triggers
  const hideShell = currentView === 'splash' || currentView === 'login';

  return (
    <div className="bg-[#f6f9ff] min-h-screen text-slate-900 flex">
      {/* Sidebar */}
      {!hideShell && (
        <Sidebar currentView={currentView} setView={setView} />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${!hideShell ? 'ml-64' : ''}`}>
        {/* Dynamic Header container */}
        {!hideShell && (
          <TopAppBar
            currentView={currentView}
            setView={setView}
            onBack={() => {
              // Context aware back triggers
              if (currentView === 'worker-profile') {
                setView('workers');
              } else if (currentView === 'advance-payments') {
                setView('salary');
              } else {
                setView('dashboard');
              }
            }}
            onEditProfile={() => alert(`Profile editor console opened for ${activeWorker.name}`)}
            notificationsCount={notificationsCount}
            onClearNotifications={() => setNotificationsCount(0)}
          />
        )}

        {/* Main viewport transitions */}
        <main className={!hideShell ? 'px-8 py-8 w-full max-w-7xl mx-auto flex-1' : 'flex-1'}>
          <AnimatePresence mode="wait">
            {currentView === 'splash' && (
              <motion.div key="splash" className="w-full">
                <SplashView onComplete={() => setView('login')} />
              </motion.div>
            )}

            {currentView === 'login' && (
              <motion.div key="login" className="w-full">
                <LoginView onLoginSuccess={() => setView('dashboard')} />
              </motion.div>
            )}

            {currentView === 'dashboard' && (
              <motion.div key="dashboard" className="w-full">
                <DashboardView
                  workers={workers}
                  attendance={attendance}
                  salaries={salaries}
                  setView={setView}
                  setSelectedWorkerId={(id) => {
                    setSelectedWorkerId(id);
                    setView('worker-profile');
                  }}
                  onQuickAddWorkerTrigger={() => setIsAddWorkerOpen(true)}
                />
              </motion.div>
            )}

            {currentView === 'workers' && (
              <motion.div key="workers" className="w-full">
                <WorkersView
                  workers={workers}
                  setView={setView}
                  setSelectedWorkerId={setSelectedWorkerId}
                  onAddWorker={handleAddWorker}
                  isAddModalOpen={isAddWorkerOpen}
                  setIsAddModalOpen={setIsAddWorkerOpen}
                />
              </motion.div>
            )}

            {currentView === 'worker-profile' && (
              <motion.div key="worker-profile" className="w-full">
                <WorkerProfileView
                  worker={activeWorker}
                  attendance={attendance}
                  salaries={salaries}
                  setView={setView}
                  onNavigateToAdvances={() => setView('advance-payments')}
                  onNavigateToSalaryApproval={() => handleApproveSalary(activeWorker.id)}
                />
              </motion.div>
            )}

            {currentView === 'attendance' && (
              <motion.div key="attendance" className="w-full">
                <AttendanceView
                  workers={workers}
                  attendance={attendance}
                  onUpdateAttendance={handleUpdateAttendance}
                />
              </motion.div>
            )}

            {currentView === 'salary' && (
              <motion.div key="salary" className="w-full">
                <SalaryView
                  workers={workers}
                  salaries={salaries}
                  onApproveSalary={handleApproveSalary}
                  onEditSalary={handleEditSalary}
                  setView={setView}
                />
              </motion.div>
            )}

            {currentView === 'advance-payments' && (
              <motion.div key="advance-payments" className="w-full">
                <AdvancePaymentsView
                  workers={workers}
                  advances={advances}
                  onAddAdvance={handleAddAdvance}
                  onUpdateAdvanceStatus={handleUpdateAdvanceStatus}
                  setView={setView}
                />
              </motion.div>
            )}

            {currentView === 'analytics' && (
              <motion.div key="analytics" className="w-full">
                <AnalyticsView workers={workers} setView={setView} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
