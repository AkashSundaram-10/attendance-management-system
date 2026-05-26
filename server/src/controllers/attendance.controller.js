const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const markAttendance = async (req, res, next) => {
  try {
    const { workerId, date, status, checkIn, checkOut, overtimeHours, notes } = req.body;

    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        workerId,
        date: attendanceDate,
      },
    });

    let attendance;
    if (existingAttendance) {
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { status, checkIn, checkOut, overtimeHours, notes },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          workerId,
          date: attendanceDate,
          status,
          checkIn,
          checkOut,
          overtimeHours,
          notes,
        },
      });
    }

    // Unfreeze manual salary overrides when attendance is updated so it dynamically recalculates
    await prisma.salaryRecord.updateMany({
      where: {
        workerId,
        month: attendanceDate.getMonth() + 1,
        year: attendanceDate.getFullYear()
      },
      data: { isManuallyEdited: false }
    });

    sendSuccess(res, 200, 'Attendance marked successfully', attendance);
  } catch (error) {
    next(error);
  }
};

const bulkMarkAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const operations = records.map((record) => {
      return prisma.attendance.upsert({
        where: {
          workerId_date: {
            workerId: record.workerId,
            date: attendanceDate,
          },
        },
        update: {
          status: record.status,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          overtimeHours: record.overtimeHours,
          notes: record.notes,
        },
        create: {
          workerId: record.workerId,
          date: attendanceDate,
          status: record.status,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          overtimeHours: record.overtimeHours,
          notes: record.notes,
        },
      });
    });

    const results = await prisma.$transaction(operations);
    
    // Unfreeze manual overrides for these workers for this month
    const workerIds = records.map(r => r.workerId);
    await prisma.salaryRecord.updateMany({
      where: {
        workerId: { in: workerIds },
        month: attendanceDate.getMonth() + 1,
        year: attendanceDate.getFullYear()
      },
      data: { isManuallyEdited: false }
    });

    sendSuccess(res, 200, 'Bulk attendance marked successfully', {
      processed: results.length,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const { date, workerId } = req.query;
    
    let where = {
      worker: { isDeleted: false }
    };
    if (date) {
      const targetDate = new Date(date);
      targetDate.setUTCHours(0, 0, 0, 0);
      where.date = targetDate;
    }
    if (workerId) {
      where.workerId = workerId;
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where,
      include: {
        worker: {
          select: { fullName: true, workerCode: true, dailyWage: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    sendSuccess(res, 200, 'Attendance fetched successfully', attendanceRecords);
  } catch (error) {
    next(error);
  }
};

const getMonthlyAttendance = async (req, res, next) => {
  try {
    const { month, year, workerId } = req.query;
    
    if (!month || !year) {
      return next(new AppError('Month and year are required', 400));
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    let where = {
      date: {
        gte: startDate,
        lte: endDate,
      },
      worker: { isDeleted: false }
    };

    if (workerId) {
      where.workerId = workerId;
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where,
      include: {
        worker: {
          select: { fullName: true, workerCode: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Generate summary
    const summary = attendanceRecords.reduce((acc, curr) => {
      if (!acc[curr.workerId]) {
        acc[curr.workerId] = {
          workerId: curr.workerId,
          workerName: curr.worker?.fullName,
          totalPresent: 0,
          totalAbsent: 0,
          totalHalfDay: 0,
          totalOvertimeHours: 0,
          totalDays: 0,
        };
      }

      if (curr.status === 'PRESENT') {
        acc[curr.workerId].totalPresent++;
        acc[curr.workerId].totalDays += 1;
      } else if (curr.status === 'HALF_DAY') {
        acc[curr.workerId].totalHalfDay++;
        acc[curr.workerId].totalDays += 0.5;
      } else if (curr.status === 'ABSENT') {
        acc[curr.workerId].totalAbsent++;
      }
      
      if (curr.overtimeHours) {
        acc[curr.workerId].totalOvertimeHours += curr.overtimeHours;
      }

      return acc;
    }, {});

    sendSuccess(res, 200, 'Monthly attendance fetched successfully', {
      records: attendanceRecords,
      summary: Object.values(summary),
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceByWorker = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    
    const attendanceRecords = await prisma.attendance.findMany({
      where: { workerId },
      orderBy: { date: 'desc' },
      take: 30, // Get last 30 records
    });

    sendSuccess(res, 200, 'Worker attendance fetched successfully', attendanceRecords);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  bulkMarkAttendance,
  getAttendance,
  getMonthlyAttendance,
  getAttendanceByWorker,
};
