const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const createPayment = async (req, res, next) => {
  try {
    const { workerId, salaryRecordId, amountPaid, paymentDate, paymentMethod, note } = req.body;

    const payment = await prisma.payment.create({
      data: {
        workerId,
        salaryRecordId,
        amountPaid,
        paymentDate: paymentDate || new Date(),
        paymentMethod,
        note,
      },
    });

    // Update salary record status if associated
    if (salaryRecordId) {
      const salaryRecord = await prisma.salaryRecord.findUnique({
        where: { id: salaryRecordId },
        include: { payments: true },
      });

      if (salaryRecord) {
        const totalPaid = salaryRecord.payments.reduce((sum, p) => sum + p.amountPaid, 0);
        
        let newStatus = 'PENDING';
        if (totalPaid >= salaryRecord.finalSalary) {
          newStatus = 'PAID';
        } else if (totalPaid > 0) {
          newStatus = 'PARTIAL';
        }

        await prisma.salaryRecord.update({
          where: { id: salaryRecordId },
          data: { paymentStatus: newStatus },
        });
      }
    }

    sendSuccess(res, 201, 'Payment recorded successfully', payment);
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const { workerId } = req.query;

    let where = {};
    if (workerId) {
      where.workerId = workerId;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        worker: { select: { fullName: true, workerCode: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    sendSuccess(res, 200, 'Payments fetched successfully', payments);
  } catch (error) {
    next(error);
  }
};

const getWorkerPayments = async (req, res, next) => {
  try {
    const { workerId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { workerId },
      orderBy: { paymentDate: 'desc' },
    });

    sendSuccess(res, 200, 'Worker payments fetched successfully', payments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getPayments,
  getWorkerPayments,
};
