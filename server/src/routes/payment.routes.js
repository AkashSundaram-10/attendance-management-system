const express = require('express');
const paymentController = require('../controllers/payment.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { createPaymentSchema } = require('../validators/payment.validator');

const router = express.Router();

router.use(protect);

router.post('/', validate(createPaymentSchema), paymentController.createPayment);
router.get('/', paymentController.getPayments);
router.get('/:workerId', paymentController.getWorkerPayments);

module.exports = router;
