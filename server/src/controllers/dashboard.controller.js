const prisma = require('../config/db');
const { sendSuccess } = require('../utils/response');

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [
      totalWorkers,
      activeWorkers,
      presentToday,
      absentToday,
      pendingPayments
    ] = await Promise.all([
      prisma.worker.count({ where: { isDeleted: false } }),
      prisma.worker.count({ where: { isDeleted: false, status: 'ACTIVE' } }),
      prisma.attendance.count({ where: { date: today, status: 'PRESENT' } }),
      prisma.attendance.count({ where: { date: today, status: 'ABSENT' } }),
      prisma.salaryRecord.count({ where: { paymentStatus: { in: ['PENDING', 'PARTIAL'] } } }),
    ]);

    sendSuccess(res, 200, 'Dashboard stats fetched successfully', {
      totalWorkers,
      activeWorkers,
      presentToday,
      absentToday,
      pendingPayments,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceOverview = async (req, res, next) => {
  try {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6); // Last 7 days

    const attendanceData = await prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: {
        date: { gte: startDate },
      },
      _count: true,
    });

    sendSuccess(res, 200, 'Attendance overview fetched successfully', attendanceData);
  } catch (error) {
    next(error);
  }
};

const getPaymentOverview = async (req, res, next) => {
  try {
    // Current month salary summary
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const currentMonthSalaries = await prisma.salaryRecord.aggregate({
      where: { month, year },
      _sum: { finalSalary: true, advanceDeduction: true },
    });

    const currentMonthPayments = await prisma.payment.aggregate({
      where: { 
        paymentDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        }
      },
      _sum: { amountPaid: true },
    });

    sendSuccess(res, 200, 'Payment overview fetched successfully', {
      totalSalaryDue: currentMonthSalaries._sum.finalSalary || 0,
      totalAdvancesDeducted: currentMonthSalaries._sum.advanceDeduction || 0,
      totalPaidThisMonth: currentMonthPayments._sum.amountPaid || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAttendanceOverview,
  getPaymentOverview,
};
