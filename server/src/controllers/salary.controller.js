const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const generateSalary = async (req, res, next) => {
  try {
    const { month, year, workerId, targetDate, forceRecalculate } = req.body;

    const getWeek = (date) => {
      const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    };

    let startDate, endDate, dbMonth = month;

    if (targetDate) {
      const d = new Date(targetDate);
      const day = d.getUTCDay() || 7;
      startDate = new Date(d);
      startDate.setUTCDate(d.getUTCDate() - day + 1);
      startDate.setUTCHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setUTCDate(startDate.getUTCDate() + 6);
      endDate.setUTCHours(23, 59, 59, 999);
      
      dbMonth = getWeek(d);
    } else {
      endDate.setUTCHours(23, 59, 59, 999);
    }

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
      let presentDays = 0;
      let halfDayDays = 0;
      let nightShiftDays = 0;
      let grossSalary = 0;
      
      let computedBasicSalary = 0;
      let computedOvertimeSalary = 0;
      let computedHalfDaySalary = 0;
      let computedNightShiftSalary = 0;

      attendances.forEach(att => {
        const dailyRate = worker.dailyWage || 1000;
        const overtimeRate = worker.overtimeRate || (dailyRate * 1.5);

        const statusUpper = att.status ? att.status.toUpperCase() : '';
        if (statusUpper === 'PRESENT') {
           grossSalary += dailyRate;
           computedBasicSalary += dailyRate;
           totalDays += 1;
           presentDays += 1;
        } else if (statusUpper === 'OVERTIME') {
           const oRate = Math.max(overtimeRate, 1500);
           grossSalary += oRate;
           computedOvertimeSalary += oRate;
           totalDays += 1;
           totalOvertimeHours += 1;
        } else if (statusUpper === 'HALF_DAY' || statusUpper === 'HALF DAY') {
           grossSalary += 500;
           computedHalfDaySalary += 500;
           totalDays += 0.5;
           halfDayDays += 0.5;
        } else if (statusUpper === 'NIGHT_SHIFT' || statusUpper === 'NIGHT SHIFT') {
           grossSalary += 1000;
           computedNightShiftSalary += 1000;
           totalDays += 1;
           nightShiftDays += 1;
        }
        
        if (att.overtimeHours && statusUpper !== 'OVERTIME') totalOvertimeHours += att.overtimeHours;
      });

      // No dynamic base rate. Hardcoded as per user instruction.

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
      let finalSalary = Math.max(0, grossSalary - advanceDeduction);

      const existingRecord = await prisma.salaryRecord.findUnique({
        where: { workerId_month_year: { workerId: worker.id, month: dbMonth, year } }
      });

      let finalIsManuallyEdited = existingRecord ? existingRecord.isManuallyEdited : false;
      let finalBasicSalary = null;
      let finalOvertimeSalary = null;
      let finalHalfDaySalary = null;
      let finalNightShiftSalary = null;

      if (existingRecord && existingRecord.isManuallyEdited) {
        if (forceRecalculate) {
          if (totalDays === 0) {
            // Revert completely to 0 if all days are absent
            finalIsManuallyEdited = false;
            grossSalary = 0;
            finalSalary = 0;
          } else {
            // Retain manual edit, but adjust it mathematically by the difference in attendance
            finalIsManuallyEdited = true;

            const oldPresentDays = Number(existingRecord.presentDays) || 0;
            const oldHalfDayDays = Number(existingRecord.halfDayDays) || 0;
            const oldNightShiftDays = Number(existingRecord.nightShiftDays) || 0;
            const oldOvertimeHours = Number(existingRecord.overtimeHours) || 0;

            const diffPresent = presentDays - oldPresentDays;
            const diffHalfDay = halfDayDays - oldHalfDayDays;
            const diffNightShift = nightShiftDays - oldNightShiftDays;
            const diffOvertime = totalOvertimeHours - oldOvertimeHours;

            const dailyRate = worker.dailyWage || 1000;
            const overtimeRate = Math.max(worker.overtimeRate || (dailyRate * 1.5), 1500);

            const currentBasic = existingRecord.basicSalary !== null ? existingRecord.basicSalary : (oldPresentDays * dailyRate);
            const currentOvertime = existingRecord.overtimeSalary !== null ? existingRecord.overtimeSalary : (oldOvertimeHours * overtimeRate);
            const currentHalfDay = existingRecord.halfDaySalary !== null ? existingRecord.halfDaySalary : (oldHalfDayDays * 500);
            const currentNightShift = existingRecord.nightShiftSalary !== null ? existingRecord.nightShiftSalary : (oldNightShiftDays * 1000);

            finalBasicSalary = presentDays === 0 ? 0 : Math.max(0, currentBasic + (diffPresent * dailyRate));
            finalOvertimeSalary = totalOvertimeHours === 0 ? 0 : Math.max(0, currentOvertime + (diffOvertime * overtimeRate));
            finalHalfDaySalary = halfDayDays === 0 ? 0 : Math.max(0, currentHalfDay + (diffHalfDay * 500));
            finalNightShiftSalary = nightShiftDays === 0 ? 0 : Math.max(0, currentNightShift + (diffNightShift * 1000));
            
            grossSalary = finalBasicSalary + finalOvertimeSalary + finalHalfDaySalary + finalNightShiftSalary;
            finalSalary = Math.max(0, grossSalary - advanceDeduction);
          }
        } else {
          grossSalary = existingRecord.grossSalary;
          finalSalary = existingRecord.finalSalary;
          finalBasicSalary = existingRecord.basicSalary;
          finalOvertimeSalary = existingRecord.overtimeSalary;
          finalHalfDaySalary = existingRecord.halfDaySalary;
          finalNightShiftSalary = existingRecord.nightShiftSalary;
          totalDays = existingRecord.totalDays !== null ? existingRecord.totalDays : totalDays;
          presentDays = existingRecord.presentDays !== null ? existingRecord.presentDays : presentDays;
          halfDayDays = existingRecord.halfDayDays !== null ? existingRecord.halfDayDays : halfDayDays;
          nightShiftDays = existingRecord.nightShiftDays !== null ? existingRecord.nightShiftDays : nightShiftDays;
          totalOvertimeHours = existingRecord.overtimeHours !== null ? existingRecord.overtimeHours : totalOvertimeHours;
        }
      }

      // Save record
      const record = await prisma.salaryRecord.upsert({
        where: {
          workerId_month_year: { workerId: worker.id, month: dbMonth, year }
        },
        update: {
          totalDays,
          presentDays,
          halfDayDays,
          nightShiftDays,
          overtimeHours: totalOvertimeHours,
          grossSalary,
          advanceDeduction,
          finalSalary,
          isManuallyEdited: finalIsManuallyEdited,
          ...(finalIsManuallyEdited ? { 
            basicSalary: finalBasicSalary,
            overtimeSalary: finalOvertimeSalary,
            halfDaySalary: finalHalfDaySalary,
            nightShiftSalary: finalNightShiftSalary
          } : {
            basicSalary: computedBasicSalary,
            overtimeSalary: computedOvertimeSalary,
            halfDaySalary: computedHalfDaySalary,
            nightShiftSalary: computedNightShiftSalary
          })
        },
        create: {
          workerId: worker.id,
          month: dbMonth,
          year,
          totalDays,
          presentDays,
          halfDayDays,
          nightShiftDays,
          overtimeHours: totalOvertimeHours,
          grossSalary,
          basicSalary: computedBasicSalary,
          overtimeSalary: computedOvertimeSalary,
          halfDaySalary: computedHalfDaySalary,
          nightShiftSalary: computedNightShiftSalary,
          advanceDeduction,
          finalSalary,
          paymentStatus: 'PENDING'
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

    let where = {
      worker: { isDeleted: false }
    };
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (workerId) where.workerId = workerId;

    const salaries = await prisma.salaryRecord.findMany({
      where,
      include: {
        worker: { select: { fullName: true, workerCode: true } },
        payments: true
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
      where: { 
        workerId,
        worker: { isDeleted: false }
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    sendSuccess(res, 200, 'Worker salaries fetched successfully', salaries);
  } catch (error) {
    next(error);
  }
};

  const updateSalary = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { grossSalary, overtimeHours, advanceDeduction, basicSalary, overtimeSalary, halfDaySalary, nightShiftSalary, paymentAmount, revertPayments } = req.body;
      
      let record = await prisma.salaryRecord.findUnique({ where: { id }, include: { payments: true } });
      if (!record) return res.status(404).json({ success: false, message: 'Salary record not found' });
  
      if (grossSalary !== undefined || overtimeHours !== undefined || advanceDeduction !== undefined || basicSalary !== undefined) {
        const newGross = grossSalary !== undefined ? grossSalary : record.grossSalary;
        const newAdvance = advanceDeduction !== undefined ? advanceDeduction : record.advanceDeduction;
        const finalSalary = Math.max(0, newGross - newAdvance);
  
        record = await prisma.salaryRecord.update({
          where: { id },
          data: {
            ...(grossSalary !== undefined ? { grossSalary } : {}),
            ...(overtimeHours !== undefined ? { overtimeHours } : {}),
            ...(advanceDeduction !== undefined ? { advanceDeduction } : {}),
            ...(basicSalary !== undefined ? { basicSalary } : {}),
            ...(overtimeSalary !== undefined ? { overtimeSalary } : {}),
            ...(halfDaySalary !== undefined ? { halfDaySalary } : {}),
            ...(nightShiftSalary !== undefined ? { nightShiftSalary } : {}),
            finalSalary,
            isManuallyEdited: true
          },
          include: { payments: true }
        });
      }

    if (revertPayments) {
      await prisma.payment.deleteMany({ where: { salaryRecordId: id } });
      record = await prisma.salaryRecord.update({
        where: { id },
        data: { paymentStatus: 'PENDING' },
        include: { payments: true }
      });
    } else if (paymentAmount !== undefined) {
      await prisma.payment.create({
        data: {
          workerId: record.workerId,
          salaryRecordId: record.id,
          amountPaid: paymentAmount,
        }
      });
      record = await prisma.salaryRecord.findUnique({ where: { id }, include: { payments: true } });
      const totalPaid = record.payments.reduce((acc, curr) => acc + curr.amountPaid, 0);
      const netPay = record.grossSalary - record.advanceDeduction;
      if (totalPaid >= netPay) {
         record = await prisma.salaryRecord.update({ where: { id }, data: { paymentStatus: 'PAID' }, include: { payments: true } });
      } else {
         record = await prisma.salaryRecord.update({ where: { id }, data: { paymentStatus: 'PENDING' }, include: { payments: true } });
      }
    }

    sendSuccess(res, 200, 'Salary updated successfully', record);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateSalary,
  getSalaries,
  getWorkerSalary,
  updateSalary,
};
