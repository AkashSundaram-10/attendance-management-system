const express = require('express');
const advanceController = require('../controllers/advance.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { createAdvanceSchema } = require('../validators/advance.validator');

const router = express.Router();

router.use(protect);

router.post('/', validate(createAdvanceSchema), advanceController.createAdvance);
router.get('/', advanceController.getAdvances);
router.get('/:workerId', advanceController.getAdvancesByWorker);

module.exports = router;
