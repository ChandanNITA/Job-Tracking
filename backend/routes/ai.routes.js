const express = require('express');
const router = express.Router();
const { getInterviewQuestions } = require('../controllers/ai.controller');

// POST /api/ai/interview-questions
router.post('/interview-questions', getInterviewQuestions);

module.exports = router;
