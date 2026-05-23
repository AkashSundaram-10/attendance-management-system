const { z } = require('zod');

const createWorkerSchema = {
  body: z.object({
    workerCode: z.string().min(1, 'Worker code is required'),
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: z.string().optional(),
    wageType: z.enum(['DAILY', 'MONTHLY', 'HOURLY']).default('DAILY'),
    dailyWage: z.number().min(0, 'Wage must be positive'),
    overtimeRate: z.number().min(0).optional(),
    joiningDate: z.string().transform((str) => new Date(str)),
    status: z.enum(['ACTIVE', 'DISABLED']).default('ACTIVE'),
  }),
};

const updateWorkerSchema = {
  body: z.object({
    workerCode: z.string().optional(),
    fullName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: z.string().optional(),
    wageType: z.enum(['DAILY', 'MONTHLY', 'HOURLY']).optional(),
    dailyWage: z.number().min(0).optional(),
    overtimeRate: z.number().min(0).optional(),
    joiningDate: z.string().transform((str) => new Date(str)).optional(),
    status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  }),
};

module.exports = {
  createWorkerSchema,
  updateWorkerSchema,
};
