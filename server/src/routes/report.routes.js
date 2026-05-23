const express = require('express');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/attendance/excel', reportController.generateAttendanceExcel);
router.get('/attendance/pdf', reportController.generateAttendancePDF);
router.get('/salary/excel', reportController.generateSalaryExcel);

module.exports = router;
