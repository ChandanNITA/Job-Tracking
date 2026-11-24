const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobStats,
} = require('../controllers/job.controller');

// Stats route (placed before :id route so 'stats' isn't treated as an ID)
router.get('/stats/summary', getJobStats);

// Main CRUD routes
router.route('/')
  .get(getJobs)
  .post(createJob);

router.route('/:id')
  .get(getJobById)
  .put(updateJob)
  .delete(deleteJob);

module.exports = router;
