const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const generateSalary = async (req, res, next) => {
  try {
    const { month, year, workerId } = req.body;

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0)); // Last day of month
    endDate.setUTCHours(23, 59, 59, 999);

    // Get workers
    const workers = await prisma.worker.findMany({
      where: {
        isDeleted: false,
        ...(workerId ? { id: workerId } : {}),
      },
    });

    const results = [];

    for (const worker of workers) {
      // Get attendance
      const attendances = await prisma.attendance.findMany({
        where: {
          workerId: worker.id,
          date: { gte: startDate, lte: endDate },
        },
      });

      let totalDays = 0;
      let totalOvertimeHours = 0;

      attendances.forEach(att => {
        if (att.status === 'PRESENT') totalDays += 1;
        else if (att.status === 'HALF_DAY') totalDays += 0.5;
        
        if (att.overtimeHours) totalOvertimeHours += att.overtimeHours;
      });

      // Gross Salary calculation
      let grossSalary = 0;
      if (worker.wageType === 'DAILY') {
        grossSalary = totalDays * worker.dailyWage;
      } else if (worker.wageType === 'MONTHLY') {
        // If monthly, assume full salary minus absent days proportionally, or simpler:
        // for this scope, let's just use monthly wage if they are present mostly, 
        // or daily proportion of monthly wage. Let's use dailyWage as monthly amount for MONTHLY workers
        // wait, the schema has `dailyWage`. Let's assume dailyWage stores the base rate.
        grossSalary = worker.dailyWage; // Needs business logic clarification, using base
      } else if (worker.wageType === 'HOURLY') {
        // Assume dailyWage is hourly rate
        grossSalary = totalDays * 8 * worker.dailyWage; 
      }

      // Add overtime
      const overtimeRate = worker.overtimeRate || (worker.dailyWage / 8);
      const overtimeBonus = totalOvertimeHours * overtimeRate;
      grossSalary += overtimeBonus;

      // Handle Advances (simplistic deduction for demo, usually you'd track total unpaid advances)
      // We will deduct up to the grossSalary amount
      const advances = await prisma.advance.aggregate({
        where: { workerId: worker.id }, // in real life, filter by unpaid advances
        _sum: { amount: true }
      });
      
      const payments = await prisma.payment.aggregate({
        where: { workerId: worker.id, salaryRecordId: null }, // payments against advances
        _sum: { amountPaid: true }
      });

      // Simplified logic: we just calculate advance deduction requested for this month. 
      // For this system, let's just take all advances this month as deduction.
      const monthAdvances = await prisma.advance.aggregate({
        where: {
          workerId: worker.id,
          createdAt: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      });

      const advanceDeduction = monthAdvances._sum.amount || 0;
      const finalSalary = Math.max(0, grossSalary - advanceDeduction);

      // Save record
      const record = await prisma.salaryRecord.upsert({
        where: {
          workerId_month_year: { workerId: worker.id, month, year }
        },
        update: {
          totalDays,
          overtimeHours: totalOvertimeHours,
          grossSalary,
          advanceDeduction,
          finalSalary,
        },
        create: {
          workerId: worker.id,
          month,
          year,
          totalDays,
          overtimeHours: totalOvertimeHours,
          grossSalary,
          advanceDeduction,
          finalSalary,
        }
      });

      results.push(record);
    }

    sendSuccess(res, 200, 'Salaries generated successfully', results);
  } catch (error) {
    next(error);
  }
};

const getSalaries = async (req, res, next) => {
  try {
    const { month, year, workerId } = req.query;

    let where = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (workerId) where.workerId = workerId;

    const salaries = await prisma.salaryRecord.findMany({
      where,
      include: {
        worker: { select: { fullName: true, workerCode: true } }
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    sendSuccess(res, 200, 'Salaries fetched successfully', salaries);
  } catch (error) {
    next(error);
  }
};

const getWorkerSalary = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    
    const salaries = await prisma.salaryRecord.findMany({
      where: { workerId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    sendSuccess(res, 200, 'Worker salaries fetched successfully', salaries);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateSalary,
  getSalaries,
  getWorkerSalary,
};
