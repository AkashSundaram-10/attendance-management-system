import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppView, Worker, AttendanceRecord, SalaryRecord, AdvancePayment } from './types';
import {
  INITIAL_WORKERS,
  INITIAL_ATTENDANCE,
  INITIAL_SALARY_RECORDS,
  INITIAL_ADVANCES,
} from './initialData';
import { api, getCurrentPeriod } from './api';

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
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import DeletedWorkersView from './components/DeletedWorkersView';
import PinPromptModal from './components/PinPromptModal';
export default function App() {
  // App views state machines
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [salaries, setSalaries] = useState<SalaryRecord[]>(INITIAL_SALARY_RECORDS);
  const [advances, setAdvances] = useState<AdvancePayment[]>(INITIAL_ADVANCES);

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('WTP-4921'); // Default Marcus
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(1);
  
  // Security Pin Prompt Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [secureAction, setSecureAction] = useState<(() => void) | null>(null);

  const requestSecureAction = (action: () => void) => {
    setSecureAction(() => action);
    setIsPinModalOpen(true);
  };

  const activeWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0] || {} as Worker;

  useEffect(() => {
    // Initial fetch from backend
    api.getWorkers().then((fetchedWorkers) => {
      setWorkers(fetchedWorkers);
      if (fetchedWorkers.length > 0 && !fetchedWorkers.find(w => w.id === selectedWorkerId)) {
        setSelectedWorkerId(fetchedWorkers[0].id);
      }
    });
    api.getAttendance().then((fetchedAttendance) => {
      setAttendance(fetchedAttendance);
    });
    
    api.generateSalary(new Date().toISOString())
      .then(() => api.getSalaries())
      .then((fetchedSalaries) => setSalaries(fetchedSalaries))
      .catch((e) => alert("Failed to fetch/generate salaries: " + e.message));
  }, []);

  // Callback to add a new worker
  const handleAddWorker = async (newWorker: Omit<Worker, 'id' | 'joinedDate'>) => {
    try {
      await api.createWorker(newWorker);
      const updatedWorkers = await api.getWorkers();
      setWorkers(updatedWorkers);
      
      const recruit = updatedWorkers[0] || newWorker; 

      // Create automatic blank salary record for October 2023 Period
      const mockSalary: SalaryRecord = {
        workerId: recruit.id,
        period: `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`,
        daysWorked: 0,
        totalDays: 0,
        grossPay: 0,
        overtimePay: 0,
        advanceDeduction: 0,
        status: 'Pending',
      };
      setSalaries((prev) => [mockSalary, ...prev]);

      // Push notification alert
      setNotificationsCount((c) => c + 1);
    } catch (e) {
      alert("Failed to create worker in DB");
    }
  };

  const handleUpdateAttendance = (
    workerId: string,
    status: 'Present' | 'Absent' | 'Overtime' | 'UpdateTimes',
    checkInTimeStr?: string,
    checkOutTimeStr?: string,
    targetDateStr?: string
  ) => {
    setAttendance((prev) => {
      const activeDate = targetDateStr || new Date().toISOString().split('T')[0];
      const existingIdx = prev.findIndex((a) => a.workerId === workerId && a.date === activeDate);

      const nextRecords = [...prev];
      let newStatus = status;
      if (status === 'UpdateTimes') {
         newStatus = existingIdx > -1 ? nextRecords[existingIdx].status : 'Present';
      }

      let checkInTime = checkInTimeStr ?? (status === 'UpdateTimes' ? (existingIdx > -1 ? nextRecords[existingIdx].checkIn : '09:00') : (status === 'Absent' ? '--:--' : '09:00'));
      let checkOutTime = checkOutTimeStr ?? (status === 'UpdateTimes' ? (existingIdx > -1 ? nextRecords[existingIdx].checkOut : '18:00') : (status === 'Absent' ? '--:--' : (status === 'Overtime' ? '21:00' : '18:00')));

      if (existingIdx > -1) {
        nextRecords[existingIdx] = {
          ...nextRecords[existingIdx],
          status: newStatus as 'Present'|'Absent'|'Overtime',
          checkIn: checkInTime,
          checkOut: checkOutTime,
          overtimeHours: newStatus === 'Overtime' ? 1 : 0,
        };
      } else {
        nextRecords.push({
          workerId,
          date: activeDate,
          status: newStatus as 'Present'|'Absent'|'Overtime',
          checkIn: checkInTime,
          checkOut: checkOutTime,
          overtimeHours: newStatus === 'Overtime' ? 1 : 0,
        });
      }

      // Update active salary days count dynamically and enforce strict wage limits
      setSalaries((prevSal) => {
        return prevSal.map((s) => {
          const currentPeriod = getCurrentPeriod();
          if (s.workerId === workerId && s.period === currentPeriod) {
            const currentMonthAttendances = nextRecords.filter(a => a.workerId === workerId && a.date.startsWith(activeDate.substring(0, 7)));
            let pDays = 0, oDays = 0;
            currentMonthAttendances.forEach(a => {
              if (a.status === 'Present') pDays++;
              if (a.status === 'Overtime') oDays++;
            });
            return {
              ...s,
              daysWorked: pDays + oDays,
              grossPay: pDays * 1000,
              overtimePay: oDays * 1500,
            };
          }
          return s;
        });
      });

      const recordToSave = nextRecords.find(a => a.workerId === workerId && a.date === activeDate);
      if (recordToSave) {
        api.markAttendance(recordToSave)
          .then(() => api.generateSalary(activeDate, workerId))
          .then(() => api.getSalaries())
          .then((freshSalaries) => setSalaries(freshSalaries))
          .catch(() => console.error("Failed to sync attendance/salary in DB"));
      }

      return nextRecords;
    });
  };

  const handleEditWorker = async (id: string, updatedWorker: Partial<Worker>) => {
    try {
      await api.updateWorker(id, updatedWorker);
      const updatedWorkers = await api.getWorkers();
      setWorkers(updatedWorkers);
    } catch (e) {
      alert("Failed to update worker in DB");
    }
  };

  const handleDeleteWorker = async (id: string) => {
    if (true) {
      try {
        await api.deleteWorker(id);
        const updatedWorkers = await api.getWorkers();
        setWorkers(updatedWorkers);
        if (selectedWorkerId === id) setCurrentView('workers');
        const updatedAttendance = await api.getAttendance();
        setAttendance(updatedAttendance);
        const updatedSalaries = await api.getSalaries();
        setSalaries(updatedSalaries);
      } catch (e) {
        alert("Failed to delete worker in DB");
      }
    }
  };

  // Callback to edit salary
  const handleEditSalary = (workerId: string, grossPay: number, overtimePay: number, period?: string) => {
    const s = period ? salaries.find(sal => sal.workerId === workerId && sal.period === period) : salaries.find(sal => sal.workerId === workerId);
    if (s && s.id) {
      // Overtime logic mapping to backend
      const overtimeHours = overtimePay / 1500;
      api.updateSalary(s.id, { grossSalary: grossPay + overtimePay, overtimeHours })
        .then(() => api.getSalaries())
        .then(setSalaries)
        .catch(() => alert('Failed to edit salary in DB'));
    }
  };

  const handleToggleSalaryStatus = async (id: string, amount?: number, isRevert?: boolean) => {
    const targetSalary = salaries.find(s => s.id === id);
    if (!targetSalary) return;

    try {
      if (isRevert) {
        await api.updateSalary(targetSalary.id!, { revertPayments: true });
      } else if (targetSalary.status === 'Pending') {
        const netPay = targetSalary.grossPay + targetSalary.overtimePay - targetSalary.advanceDeduction;
        const paymentToMake = amount ?? netPay;
        await api.updateSalary(targetSalary.id!, { paymentAmount: paymentToMake });
      }
      
      const freshSalaries = await api.getSalaries();
      setSalaries(freshSalaries);
    } catch (err) {
      console.error("Failed to update salary status", err);
    }
  };

  // Callback to approve individual pending salary rollouts
  const handleApproveSalary = (workerId: string) => {
    setSalaries((prev) => {
      return prev.map((s) => {
        const currentPeriod = getCurrentPeriod();
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
        if (adv.workerId === workerId && adv.status === 'Given') {
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
        const currentPeriod = getCurrentPeriod();
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
    status: 'Given' | 'Recovered'
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
      {isPinModalOpen && (
        <PinPromptModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={() => {
            secureAction?.();
            setIsPinModalOpen(false);
          }}
        />
      )}
      {/* Sidebar */}
      {!hideShell && (
        <Sidebar currentView={currentView} setView={setCurrentView} />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${!hideShell ? 'ml-64' : ''}`}>
        {/* Dynamic Header container */}
        {!hideShell && (
          <TopAppBar
            currentView={currentView}
            setView={setCurrentView}
            onBack={() => {
              // Context aware back triggers
              if (currentView === 'worker-profile') {
                setCurrentView('workers');
              } else if (currentView === 'advance-payments') {
                setCurrentView('salary');
              } else {
                setCurrentView('dashboard');
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
                <SplashView onComplete={() => setCurrentView('login')} />
              </motion.div>
            )}

            {currentView === 'login' && (
              <motion.div key="login" className="w-full">
                <LoginView onLoginSuccess={() => setCurrentView('dashboard')} />
              </motion.div>
            )}

            {currentView === 'dashboard' && (
              <motion.div key="dashboard" className="w-full">
                <DashboardView
                  workers={workers}
                  attendance={attendance}
                  salaries={salaries}
                  setView={setCurrentView}
                  setSelectedWorkerId={(id) => {
                    setSelectedWorkerId(id);
                    setCurrentView('worker-profile');
                  }}
                  onQuickAddWorkerTrigger={() => setIsAddWorkerOpen(true)}
                />
              </motion.div>
            )}

            {currentView === 'workers' && (
              <motion.div key="workers" className="w-full">
                <WorkersView
                  workers={workers}
                  setView={setCurrentView}
                  setSelectedWorkerId={setSelectedWorkerId}
                  onAddWorker={(w) => requestSecureAction(() => handleAddWorker(w))}
                  isAddModalOpen={isAddWorkerOpen}
                  setIsAddModalOpen={setIsAddWorkerOpen}
                  onEditWorker={(id, w) => requestSecureAction(() => handleEditWorker(id, w))}
                  onDeleteWorker={(id) => requestSecureAction(() => handleDeleteWorker(id))}
                />
              </motion.div>
            )}

            {currentView === 'worker-profile' && (
              <motion.div key="worker-profile" className="w-full">
                <WorkerProfileView
                  worker={activeWorker}
                  attendance={attendance}
                  salaries={salaries}
                  setView={setCurrentView}
                  onNavigateToSalaryApproval={() => requestSecureAction(() => handleToggleSalaryStatus(activeWorker.id))}
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
                  onToggleSalaryStatus={(id, amount, isRevert) => requestSecureAction(() => handleToggleSalaryStatus(id, amount, isRevert))}
                  onEditSalary={handleEditSalary}
                  setView={setCurrentView}
                />
              </motion.div>
            )}



            {currentView === 'analytics' && (
              <motion.div key="analytics" className="w-full">
                <AnalyticsView workers={workers} salaries={salaries} attendance={attendance} onUpdateAttendance={handleUpdateAttendance} />
              </motion.div>
            )}

            {currentView === 'settings' && (
              <motion.div key="settings" className="w-full">
                <SettingsView />
              </motion.div>
            )}

            {currentView === 'deleted-workers' && (
              <motion.div key="deleted-workers" className="w-full">
                <DeletedWorkersView onRestore={() => window.location.reload()} requestSecureAction={requestSecureAction} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
