const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const createWorker = async (req, res, next) => {
  try {
    const existing = await prisma.worker.findUnique({
      where: { workerCode: req.body.workerCode },
    });

    if (existing) {
      return next(new AppError('Worker code already exists', 400));
    }

    const worker = await prisma.worker.create({
      data: req.body,
    });

    sendSuccess(res, 201, 'Worker created successfully', worker);
  } catch (error) {
    next(error);
  }
};

const getWorkers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      isDeleted: false,
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { workerCode: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      } : {})
    };

    const [workers, total] = await Promise.all([
      prisma.worker.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.worker.count({ where }),
    ]);

    sendSuccess(res, 200, 'Workers fetched successfully', {
      workers,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getWorkerById = async (req, res, next) => {
  try {
    const worker = await prisma.worker.findFirst({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!worker) {
      return next(new AppError('Worker not found', 404));
    }

    sendSuccess(res, 200, 'Worker fetched successfully', worker);
  } catch (error) {
    next(error);
  }
};

const updateWorker = async (req, res, next) => {
  try {
    const worker = await prisma.worker.findFirst({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!worker) {
      return next(new AppError('Worker not found', 404));
    }

    const updatedWorker = await prisma.worker.update({
      where: { id: req.params.id },
      data: req.body,
    });

    sendSuccess(res, 200, 'Worker updated successfully', updatedWorker);
  } catch (error) {
    next(error);
  }
};

const deleteWorker = async (req, res, next) => {
  try {
    const worker = await prisma.worker.findFirst({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!worker) {
      return next(new AppError('Worker not found', 404));
    }

    await prisma.worker.update({
      where: { id: req.params.id },
      data: { isDeleted: true },
    });

    sendSuccess(res, 200, 'Worker deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getDeletedWorkers = async (req, res, next) => {
  try {
    // 1. Fetch all deleted workers
    const deletedWorkers = await prisma.worker.findMany({
      where: { isDeleted: true },
      include: {
        salaries: {
          include: { payments: true }
        }
      }
    });

    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);

    const validDeleted = [];

    // 2. Cleanup old ones, keep valid ones
    for (const worker of deletedWorkers) {
      if (worker.updatedAt < twentyFiveDaysAgo) {
        // Permanently delete dependencies then worker
        await prisma.payment.deleteMany({ where: { workerId: worker.id } });
        await prisma.advance.deleteMany({ where: { workerId: worker.id } });
        await prisma.attendance.deleteMany({ where: { workerId: worker.id } });
        await prisma.salaryRecord.deleteMany({ where: { workerId: worker.id } });
        await prisma.worker.delete({ where: { id: worker.id } });
      } else {
        validDeleted.push(worker);
      }
    }

    sendSuccess(res, 200, 'Deleted workers fetched successfully', validDeleted);
  } catch (error) {
    next(error);
  }
};

const restoreWorker = async (req, res, next) => {
  try {
    await prisma.worker.update({
      where: { id: req.params.id },
      data: { isDeleted: false },
    });
    sendSuccess(res, 200, 'Worker restored successfully');
  } catch (error) {
    next(error);
  }
};

const hardDeleteWorker = async (req, res, next) => {
  try {
    const workerId = req.params.id;
    await prisma.payment.deleteMany({ where: { workerId } });
    await prisma.advance.deleteMany({ where: { workerId } });
    await prisma.attendance.deleteMany({ where: { workerId } });
    await prisma.salaryRecord.deleteMany({ where: { workerId } });
    await prisma.worker.delete({ where: { id: workerId } });

    sendSuccess(res, 200, 'Worker permanently deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getDeletedWorkers,
  restoreWorker,
  hardDeleteWorker,
};
