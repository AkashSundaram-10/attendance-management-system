const { z } = require('zod');

const generateSalarySchema = {
  body: z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2000),
    targetDate: z.string().optional(),
    workerId: z.string().optional(), // If not provided, generate for all
  }),
};

module.exports = {
  generateSalarySchema,
};
