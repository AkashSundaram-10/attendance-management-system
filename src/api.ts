export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getWeek = (date: Date) => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
};

export const getCurrentPeriod = (date = new Date()) => {
  return getMonthWeekLabel(getWeek(date), date.getUTCFullYear());
};

export const getMonthWeekLabel = (weekNo: number, year: number) => {
  const simple = new Date(Date.UTC(year, 0, 1 + (weekNo - 1) * 7));
  const dow = simple.getUTCDay() || 7;
  const isoStart = simple;
  if (dow <= 4) isoStart.setUTCDate(simple.getUTCDate() - dow + 1);
  else isoStart.setUTCDate(simple.getUTCDate() + 8 - dow);
  
  const isoEnd = new Date(isoStart);
  isoEnd.setUTCDate(isoStart.getUTCDate() + 6);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(isoStart);
  const startFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(isoStart);
  const endFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(isoEnd);
  
  const weekOfMonth = Math.ceil(isoStart.getUTCDate() / 7) || 1;
  return `${monthName} ${isoStart.getUTCFullYear()} | ${startFormat} - ${endFormat} (Week ${weekOfMonth})`;
};

export const getWeeksForMonthLabel = (monthStr: string) => {
  const parts = monthStr.split(' ');
  if (parts.length !== 2) return [];
  const year = parseInt(parts[1], 10);
  const weeks = [];
  for (let y = year - 1; y <= year + 1; y++) {
    for (let w = 1; w <= 53; w++) {
      const label = getMonthWeekLabel(w, y);
      if (label.startsWith(monthStr)) {
        if (!weeks.includes(label)) weeks.push(label);
      }
    }
  }
  return weeks;
};

export const getAllMonthsForYear = (year: number) => {
  const months = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(Date.UTC(year, m, 1));
    months.push(`${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d)} ${year}`);
  }
  return months;
};

import { Worker, AttendanceRecord, SalaryRecord } from './types';

export const api = {
  getWorker: async (id: string): Promise<Worker> => {
    const res = await fetch(`${API_BASE}/workers/${id}`);
    const data = await res.json();
    return data.data;
  },

  getDeletedWorkers: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/workers/deleted`, { cache: 'no-store' });
    const data = await res.json();
    return data.data || [];
  },

  restoreWorker: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/workers/${id}/restore`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to restore worker');
  },

  hardDeleteWorker: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/workers/${id}/hard`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to permanently delete worker');
  },

  getWorkers: async (): Promise<Worker[]> => {
    try {
      const res = await fetch(`${API_BASE}/workers`, { cache: 'no-store' });
      const data = await res.json();
      if (!data.data?.workers) return [];
      
      return data.data.workers.map((w: any) => {
        const getInitials = (name: string) => {
          if (!name) return 'WK';
          const parts = name.trim().split(/\\s+/);
          if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
          const n = parts[0].toUpperCase();
          if (n === 'MANIKANDAN') return 'MK';
          if (n === 'RAJ') return 'RJ';
          if (n.length > 1) return n[0] + n[n.length - 1]; // first and last
          return n;
        };
        return {
          id: w.id,
          name: w.fullName,
          role: w.role || 'Worker',
          avatar: `https://ui-avatars.com/api/?name=${getInitials(w.fullName)}&background=random&color=fff&bold=true`,
          status: w.status === 'ACTIVE' ? 'Active' : 'Disabled',
          phone: w.phone || '',
          email: '',
          joinedDate: new Date(w.joiningDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          dailyWage: w.dailyWage
        };
      }).sort((a: any, b: any) => a.name.localeCompare(b.name));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  createWorker: async (worker: Omit<Worker, 'id' | 'joinedDate'>) => {
    const payload = {
      workerCode: `WRK-${Math.floor(Math.random() * 8000) + 1000}`,
      fullName: worker.name,
      phone: worker.phone,
      role: worker.role,
      dailyWage: worker.dailyWage,
      joiningDate: new Date().toISOString(),
      status: worker.status === 'Active' ? 'ACTIVE' : 'DISABLED',
    };
    
    const res = await fetch(`${API_BASE}/workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to create worker');
    return res.json();
  },

  updateWorker: async (id: string, worker: Partial<Worker>) => {
    const payload: any = {};
    if (worker.name) payload.fullName = worker.name;
    if (worker.phone) payload.phone = worker.phone;
    if (worker.role) payload.role = worker.role;
    if (worker.dailyWage) payload.dailyWage = worker.dailyWage;
    if (worker.status) payload.status = worker.status === 'Active' ? 'ACTIVE' : 'DISABLED';

    const res = await fetch(`${API_BASE}/workers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to update worker');
    return res.json();
  },

  deleteWorker: async (id: string) => {
    const res = await fetch(`${API_BASE}/workers/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete worker');
  },

  getAttendance: async (): Promise<AttendanceRecord[]> => {
    try {
      const res = await fetch(`${API_BASE}/attendance`, { cache: 'no-store' });
      const data = await res.json();
      if (!data.data) return [];
      
      return data.data.map((a: any) => ({
        workerId: a.workerId,
        date: new Date(a.date).toISOString().split('T')[0],
        status: a.status === 'PRESENT' ? 'Present' : a.status === 'ABSENT' ? 'Absent' : a.status === 'HALF_DAY' ? 'Half Day' : a.status === 'NIGHT_SHIFT' ? 'Night Shift' : 'Overtime',
        checkIn: a.checkIn ? `${new Date(a.checkIn).getHours().toString().padStart(2, '0')}:${new Date(a.checkIn).getMinutes().toString().padStart(2, '0')}` : '--:--',
        checkOut: a.checkOut ? `${new Date(a.checkOut).getHours().toString().padStart(2, '0')}:${new Date(a.checkOut).getMinutes().toString().padStart(2, '0')}` : '--:--',
        overtimeHours: a.overtimeHours
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  markAttendance: async (record: AttendanceRecord) => {
    const activeDate = new Date(record.date);
    
    let checkInDate: string | null = null;
    if (record.checkIn && record.checkIn !== '--:--') {
        const parts = record.checkIn.split(' ');
        const time = parts[0];
        const modifier = parts[1];
        
        if (time) {
          let [hoursStr, minutesStr] = time.split(':');
          let hours = parseInt(hoursStr, 10);
          let minutes = parseInt(minutesStr, 10);
          
          if (modifier) {
            if (hours === 12) hours = 0;
            if (modifier.toUpperCase() === 'PM') hours += 12;
          }
          
          const d = new Date(activeDate);
          d.setHours(hours, minutes, 0);
          checkInDate = d.toISOString();
        }
    }

    let checkOutDate: string | null = null;
    if (record.checkOut && record.checkOut !== '--:--') {
        const parts = record.checkOut.split(' ');
        const time = parts[0];
        const modifier = parts[1];
        
        if (time) {
          let [hoursStr, minutesStr] = time.split(':');
          let hours = parseInt(hoursStr, 10);
          let minutes = parseInt(minutesStr, 10);
          
          if (modifier) {
            if (hours === 12) hours = 0;
            if (modifier.toUpperCase() === 'PM') hours += 12;
          }
          
          const d = new Date(activeDate);
          d.setHours(hours, minutes, 0);
          checkOutDate = d.toISOString();
        }
    }

    const payload: any = {
      workerId: record.workerId,
      date: activeDate.toISOString(),
      status: record.status.toUpperCase().replace(' ', '_'), // 'PRESENT', 'ABSENT', 'OVERTIME', 'HALF_DAY', 'NIGHT_SHIFT'
      overtimeHours: record.overtimeHours || 0,
    };
    
    if (checkInDate) payload.checkIn = checkInDate;
    if (checkOutDate) payload.checkOut = checkOutDate;
    
    const res = await fetch(`${API_BASE}/attendance/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to mark attendance');
    return res.json();
  },

  getSalaries: async (): Promise<SalaryRecord[]> => {
    try {
      const res = await fetch(`${API_BASE}/salary`, { cache: 'no-store' });
      const data = await res.json();
      if (!data.data) return [];
      
      return data.data.map((s: any) => {
        const paidAmount = s.payments ? s.payments.reduce((acc: number, curr: any) => acc + curr.amountPaid, 0) : 0;
        const overtimePay = s.overtimeSalary ?? Math.round((s.overtimeHours || 0) * 1500);
        const halfDayPay = s.halfDaySalary ?? (s.halfDayDays ? s.halfDayDays * 500 : 0);
        const nightShiftPay = s.nightShiftSalary ?? (s.nightShiftDays ? s.nightShiftDays * 1000 : 0);
        const grossPay = s.basicSalary ?? Math.round((s.grossSalary || 0) - overtimePay - halfDayPay - nightShiftPay);
        const advanceDeduction = Math.round(s.advanceDeduction || 0);
        const netPay = grossPay + overtimePay + halfDayPay + nightShiftPay - advanceDeduction;
        
        return {
          id: s.id,
          workerId: s.workerId,
          period: getMonthWeekLabel(s.month, s.year),
          daysWorked: s.totalDays,
          presentDays: s.presentDays || 0,
          halfDayDays: s.halfDayDays || 0,
          nightShiftDays: s.nightShiftDays || 0,
          overtimeDays: s.overtimeHours || 0,
          totalDays: 7,
          grossPay,
          overtimePay,
          halfDayPay,
          nightShiftPay,
          advanceDeduction,
          status: (s.paymentStatus === 'PAID' && paidAmount >= netPay) ? 'Paid' : (paidAmount >= netPay && netPay > 0 ? 'Paid' : 'Pending'),
          paidAmount,
          disbursementDate: s.payments && s.payments.length > 0 ? new Date(s.payments[s.payments.length - 1].paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined,
        };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  generateSalary: async (dateStr: string, workerId?: string, forceRecalculate?: boolean) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const payload: any = { month, year, targetDate: dateStr };
    if (workerId) payload.workerId = workerId;
    if (forceRecalculate) payload.forceRecalculate = true;
    
    const res = await fetch(`${API_BASE}/salary/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to generate salary');
    return res.json();
  },

  updateSalary: async (id: string, payload: { grossSalary?: number; overtimeHours?: number; advanceDeduction?: number; paymentAmount?: number; revertPayments?: boolean }) => {
    const res = await fetch(`${API_BASE}/salary/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update salary');
    return res.json();
  }
};
