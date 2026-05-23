const { z } = require('zod');

const createPaymentSchema = {
  body: z.object({
    workerId: z.string().uuid(),
    salaryRecordId: z.string().uuid().optional(),
    amountPaid: z.number().min(0, 'Amount must be positive'),
    paymentDate: z.string().transform((str) => new Date(str)).optional(),
    paymentMethod: z.string().optional(),
    note: z.string().optional(),
  }),
};

module.exports = {
  createPaymentSchema,
};
