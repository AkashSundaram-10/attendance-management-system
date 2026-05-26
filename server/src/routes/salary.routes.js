const express = require('express');
const salaryController = require('../controllers/salary.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { generateSalarySchema } = require('../validators/salary.validator');

const router = express.Router();

router.use(protect);

router.post('/generate', validate(generateSalarySchema), salaryController.generateSalary);
router.get('/', salaryController.getSalaries);
router.get('/:workerId', salaryController.getWorkerSalary);
router.put('/:id', salaryController.updateSalary);

module.exports = router;
