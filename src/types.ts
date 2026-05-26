export interface Worker {
  id: string; // e.g., WTP-4921 or WRK-8924
  name: string;
  role: string;
  avatar: string; // url
  status: 'Active' | 'On Leave' | 'Disabled';
  phone: string;
  email: string;
  joinedDate: string;
  dailyWage: number;
}

export interface AttendanceRecord {
  workerId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Overtime';
  checkIn: string; // e.g. "08:00 AM" or "--:--"
  checkOut: string; // e.g. "05:00 PM", "--:--" or "07:30 PM"
  overtimeHours?: number;
}

export interface SalaryRecord {
  id?: string;
  workerId: string;
  period: string; // e.g., "October 2023"
  daysWorked: number; // e.g. 22
  totalDays: number; // e.g. 22 or 24
  grossPay: number; // dailyWage * daysWorked
  overtimePay: number; // bonus or OT pay
  overtimeDays: number; // count of overtime days from attendance
  advanceDeduction: number;
  status: 'Pending' | 'Paid';
  disbursementDate?: string;
  paidAmount?: number;
}

export interface AdvancePayment {
  id: string; // e.g. ADV-101
  workerId: string;
  workerName: string;
  workerAvatar: string;
  amount: number;
  balance: number;
  status: 'Given' | 'Recovered';
  requestedDate: string;
}

export type AppView =
  | 'splash'
  | 'login'
  | 'dashboard'
  | 'workers'
  | 'attendance'
  | 'salary'
  | 'worker-profile'
  | 'analytics'
  | 'settings'
  | 'deleted-workers';
