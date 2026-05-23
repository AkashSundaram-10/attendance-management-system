const { z } = require('zod');

const createAdvanceSchema = {
  body: z.object({
    workerId: z.string().uuid(),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    note: z.string().optional(),
  }),
};

module.exports = {
  createAdvanceSchema,
};
