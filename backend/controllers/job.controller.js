const Job = require('../models/job.model');

// @desc    Get all jobs (with optional search, status filtering, and sorting)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const { search, status, sortBy = 'appliedDate', order = 'desc' } = req.query;

    const query = {};

    // Filter by status if provided and not 'All'
    if (status && status !== 'All') {
      query.status = status;
    }

    // Search by company or role (case-insensitive regex)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ company: searchRegex }, { role: searchRegex }];
    }

    // Sort order
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const jobs = await Job.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job application not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    // CastError for invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format',
      });
    }
    next(error);
  }
};

// @desc    Create new job application
// @route   POST /api/jobs
// @access  Public
const createJob = async (req, res, next) => {
  try {
    const {
      company,
      role,
      location,
      employmentType,
      workMode,
      jobLink,
      jobDescription,
      appliedDate,
      status,
      expectedSalary,
      interviewDate,
      notes,
    } = req.body;

    // Validate required fields
    if (!company || !company.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required',
      });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required',
      });
    }

    const job = await Job.create({
      company: company.trim(),
      role: role.trim(),
      location: location ? location.trim() : '',
      employmentType: employmentType || 'Full-time',
      workMode: workMode || 'Remote',
      jobLink: jobLink ? jobLink.trim() : '',
      jobDescription: jobDescription ? jobDescription.trim() : '',
      appliedDate: appliedDate || Date.now(),
      status: status || 'Applied',
      expectedSalary: expectedSalary ? Number(expectedSalary) : null,
      interviewDate: interviewDate || null,
      notes: notes ? notes.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Job application created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job application
// @route   PUT /api/jobs/:id
// @access  Public
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job application not found with id: ${req.params.id}`,
      });
    }

    // Sanitize updates
    const updates = { ...req.body };
    if (updates.company) updates.company = updates.company.trim();
    if (updates.role) updates.role = updates.role.trim();
    if (updates.expectedSalary !== undefined) {
      updates.expectedSalary = updates.expectedSalary ? Number(updates.expectedSalary) : null;
    }

    job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Job application updated successfully',
      data: job,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format',
      });
    }
    next(error);
  }
};

// @desc    Delete job application
// @route   DELETE /api/jobs/:id
// @access  Public
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job application not found with id: ${req.params.id}`,
      });
    }

    await job.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Job application deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format',
      });
    }
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/jobs/stats/summary
// @access  Public
const getJobStats = async (req, res, next) => {
  try {
    const allJobs = await Job.find({});

    const total = allJobs.length;
    const applied = allJobs.filter((j) => j.status === 'Applied').length;
    const interviewScheduled = allJobs.filter((j) => j.status === 'Interview Scheduled').length;
    const offerReceived = allJobs.filter((j) => j.status === 'Offer Received').length;
    const rejected = allJobs.filter((j) => j.status === 'Rejected').length;

    // Monthly breakdown
    const monthlyCounts = {};
    allJobs.forEach((job) => {
      const date = new Date(job.appliedDate);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        applied,
        interviewScheduled,
        offerReceived,
        rejected,
        monthlyCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobStats,
};
