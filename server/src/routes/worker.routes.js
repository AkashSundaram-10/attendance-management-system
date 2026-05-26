const express = require('express');
const workerController = require('../controllers/worker.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { createWorkerSchema, updateWorkerSchema } = require('../validators/worker.validator');

const router = express.Router();

router.use(protect); // All worker routes require authentication

router
  .route('/')
  .get(workerController.getWorkers)
  .post(validate(createWorkerSchema), workerController.createWorker);
router.get('/deleted', workerController.getDeletedWorkers);
router.post('/:id/restore', workerController.restoreWorker);
router.delete('/:id/hard', workerController.hardDeleteWorker);

router
  .route('/:id')
  .get(workerController.getWorkerById)
  .put(validate(updateWorkerSchema), workerController.updateWorker)
  .delete(workerController.deleteWorker);

module.exports = router;
