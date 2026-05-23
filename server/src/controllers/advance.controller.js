const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const createAdvance = async (req, res, next) => {
  try {
    const { workerId, amount, note } = req.body;

    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) {
      return next(new AppError('Worker not found', 404));
    }

    const advance = await prisma.advance.create({
      data: {
        workerId,
        amount,
        note,
      },
    });

    sendSuccess(res, 201, 'Advance recorded successfully', advance);
  } catch (error) {
    next(error);
  }
};

const getAdvances = async (req, res, next) => {
  try {
    const { workerId } = req.query;

    let where = {};
    if (workerId) {
      where.workerId = workerId;
    }

    const advances = await prisma.advance.findMany({
      where,
      include: {
        worker: { select: { fullName: true, workerCode: true } }
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, 200, 'Advances fetched successfully', advances);
  } catch (error) {
    next(error);
  }
};

const getAdvancesByWorker = async (req, res, next) => {
  try {
    const { workerId } = req.params;

    const advances = await prisma.advance.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate remaining balance
    const totalAdvances = advances.reduce((acc, curr) => acc + curr.amount, 0);
    // You would typically subtract advances already deducted from salaries or paid off
    // For now, return sum.

    sendSuccess(res, 200, 'Worker advances fetched successfully', {
      advances,
      summary: {
        totalAdvances,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdvance,
  getAdvances,
  getAdvancesByWorker,
};
