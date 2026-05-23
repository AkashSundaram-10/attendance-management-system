const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/attendance-overview', dashboardController.getAttendanceOverview);
router.get('/payment-overview', dashboardController.getPaymentOverview);

module.exports = router;
