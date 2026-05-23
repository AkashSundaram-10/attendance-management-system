const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { markAttendanceSchema, bulkAttendanceSchema } = require('../validators/attendance.validator');

const router = express.Router();

router.use(protect);

router.post('/mark', validate(markAttendanceSchema), attendanceController.markAttendance);
router.post('/bulk', validate(bulkAttendanceSchema), attendanceController.bulkMarkAttendance);
router.get('/', attendanceController.getAttendance);
router.get('/monthly', attendanceController.getMonthlyAttendance);
router.get('/worker/:workerId', attendanceController.getAttendanceByWorker);

module.exports = router;
