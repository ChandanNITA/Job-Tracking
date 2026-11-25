const { generateInterviewQuestions } = require('../services/ai.service');

// Simple in-memory sliding-window rate limiter per client IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 AI generations per minute

function checkRateLimit(clientIp) {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(clientIp, clientData);
    return true;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  clientData.count += 1;
  rateLimitMap.set(clientIp, clientData);
  return true;
}

// Valid enumeration options
const ALLOWED_EXPERIENCE = ['Fresher', 'Junior', 'Mid-level', 'Senior'];
const ALLOWED_DIFFICULTY = ['Easy', 'Medium', 'Hard'];
const ALLOWED_INTERVIEW_TYPES = ['Technical', 'Behavioral', 'Mixed'];

/**
 * @desc    Generate AI interview questions, revision topics, and preparation tips
 * @route   POST /api/ai/interview-questions
 * @access  Public (single-user / local app)
 */
const getInterviewQuestions = async (req, res, next) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'local';

    // 1. Rate Limiting Check
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded: Too many AI requests. Please wait a minute before generating more questions.',
      });
    }

    const {
      company,
      role,
      jobDescription = '',
      experienceLevel = 'Fresher',
      difficulty = 'Medium',
      interviewType = 'Mixed',
    } = req.body;

    // 2. Input Validation
    if (!company || typeof company !== 'string' || !company.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required.',
      });
    }

    if (!role || typeof role !== 'string' || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required.',
      });
    }

    if (company.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Company name must be under 100 characters.',
      });
    }

    if (role.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Job role must be under 100 characters.',
      });
    }

    if (jobDescription && typeof jobDescription === 'string' && jobDescription.length > 3000) {
      return res.status(400).json({
        success: false,
        message: 'Job description exceeds maximum allowed length of 3000 characters.',
      });
    }

    if (!ALLOWED_EXPERIENCE.includes(experienceLevel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid experience level. Allowed: ${ALLOWED_EXPERIENCE.join(', ')}`,
      });
    }

    if (!ALLOWED_DIFFICULTY.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty level. Allowed: ${ALLOWED_DIFFICULTY.join(', ')}`,
      });
    }

    if (!ALLOWED_INTERVIEW_TYPES.includes(interviewType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid interview type. Allowed: ${ALLOWED_INTERVIEW_TYPES.join(', ')}`,
      });
    }

    // 3. Invoke AI Service
    const aiData = await generateInterviewQuestions({
      company: company.trim(),
      role: role.trim(),
      jobDescription: (jobDescription || '').trim(),
      experienceLevel,
      difficulty,
      interviewType,
    });

    return res.status(200).json({
      success: true,
      message: 'Interview questions generated successfully.',
      data: aiData,
    });
  } catch (error) {
    console.error('[AI Controller Error]:', error.message);

    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      success: false,
      code: error.code || 'AI_GENERATION_FAILED',
      message: error.message || 'Failed to generate interview questions. Please try again.',
    });
  }
};

module.exports = {
  getInterviewQuestions,
};
