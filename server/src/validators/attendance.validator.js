const { z } = require('zod');

const markAttendanceSchema = {
  body: z.object({
    workerId: z.string().uuid('Invalid worker ID'),
    date: z.string().transform((str) => new Date(str)),
    checkIn: z.string().transform((str) => new Date(str)).optional(),
    checkOut: z.string().transform((str) => new Date(str)).optional(),
    overtimeHours: z.number().min(0).optional(),
    status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'OVERTIME', 'NIGHT_SHIFT']),
    notes: z.string().optional(),
  }),
};

const bulkAttendanceSchema = {
  body: z.object({
    date: z.string().transform((str) => new Date(str)),
    records: z.array(z.object({
      workerId: z.string().uuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'OVERTIME', 'NIGHT_SHIFT']),
      checkIn: z.string().transform((str) => new Date(str)).optional(),
      checkOut: z.string().transform((str) => new Date(str)).optional(),
      overtimeHours: z.number().min(0).optional(),
      notes: z.string().optional(),
    })).min(1, 'At least one record is required'),
  }),
};

module.exports = {
  markAttendanceSchema,
  bulkAttendanceSchema,
};
