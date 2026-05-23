const express = require('express');
const authRoutes = require('./auth.routes');
const workerRoutes = require('./worker.routes');
const attendanceRoutes = require('./attendance.routes');
const salaryRoutes = require('./salary.routes');
const advanceRoutes = require('./advance.routes');
const paymentRoutes = require('./payment.routes');
const reportRoutes = require('./report.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/workers', workerRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/salary', salaryRoutes);
router.use('/advances', advanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
