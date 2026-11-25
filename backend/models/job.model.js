const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { getIsConnected } = require('../config/db');

const JobStatusEnum = ['Applied', 'Interview Scheduled', 'Offer Received', 'Rejected'];
const EmploymentTypeEnum = ['Full-time', 'Internship', 'Contract', 'Part-time'];
const WorkModeEnum = ['Remote', 'Hybrid', 'On-site'];

// 1. Mongoose Schema Definition
const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    employmentType: {
      type: String,
      enum: {
        values: EmploymentTypeEnum,
        message: '{VALUE} is not a valid employment type',
      },
      default: 'Full-time',
    },
    workMode: {
      type: String,
      enum: {
        values: WorkModeEnum,
        message: '{VALUE} is not a valid work mode',
      },
      default: 'Remote',
    },
    jobLink: {
      type: String,
      trim: true,
      default: '',
    },
    jobDescription: {
      type: String,
      trim: true,
      default: '',
    },
    appliedDate: {
      type: Date,
      required: [true, 'Applied date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: JobStatusEnum,
        message: '{VALUE} is not a valid status',
      },
      default: 'Applied',
    },
    expectedSalary: {
      type: Number,
      default: null,
      min: [0, 'Expected salary must be a positive number'],
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for days remaining until interview
jobSchema.virtual('daysUntilInterview').get(function () {
  if (!this.interviewDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const interview = new Date(this.interviewDate);
  interview.setHours(0, 0, 0, 0);
  const diffTime = interview.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

const MongooseJob = mongoose.model('Job', jobSchema);

// 2. File-backed Fallback Store (Used seamlessly if local MongoDB daemon is offline)
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'jobs.json');

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
};

const readJobsFromFile = () => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

const writeJobsToFile = (jobs) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
};

const calculateDaysUntilInterview = (interviewDate) => {
  if (!interviewDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const interview = new Date(interviewDate);
  interview.setHours(0, 0, 0, 0);
  const diffTime = interview.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const createJobInstance = (data) => {
  const instance = { ...data };
  instance.daysUntilInterview = calculateDaysUntilInterview(instance.interviewDate);
  instance.deleteOne = async function () {
    const jobs = readJobsFromFile();
    const filtered = jobs.filter((j) => j._id !== instance._id);
    writeJobsToFile(filtered);
    return true;
  };
  return instance;
};

// Dual-Mode Model Proxy
const JobProxy = {
  find: (query = {}) => {
    if (getIsConnected()) {
      return MongooseJob.find(query);
    }

    // File-backed implementation of find() with chainable .sort()
    let jobs = readJobsFromFile().map(createJobInstance);

    // Apply status filter
    if (query.status) {
      jobs = jobs.filter((j) => j.status === query.status);
    }

    // Apply search filter ($or with regex)
    if (query.$or && Array.isArray(query.$or)) {
      jobs = jobs.filter((j) => {
        return query.$or.some((clause) => {
          if (clause.company) {
            return clause.company.test(j.company);
          }
          if (clause.role) {
            return clause.role.test(j.role);
          }
          return false;
        });
      });
    }

    const queryObj = {
      jobs,
      sort: function (sortOptions = {}) {
        const [field, order] = Object.entries(sortOptions)[0] || ['appliedDate', -1];
        jobs.sort((a, b) => {
          let valA = a[field];
          let valB = b[field];

          if (field === 'appliedDate' || field === 'createdAt' || field === 'interviewDate') {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
          }

          if (valA < valB) return order === 1 ? -1 : 1;
          if (valA > valB) return order === 1 ? 1 : -1;
          return 0;
        });
        return Promise.resolve(jobs);
      },
      then: function (resolve, reject) {
        return Promise.resolve(jobs).then(resolve, reject);
      },
      catch: function (reject) {
        return Promise.resolve(jobs).catch(reject);
      },
    };

    return queryObj;
  },

  findById: async (id) => {
    if (getIsConnected()) {
      return await MongooseJob.findById(id);
    }
    const jobs = readJobsFromFile();
    const job = jobs.find((j) => j._id === id);
    return job ? createJobInstance(job) : null;
  },

  create: async (data) => {
    if (getIsConnected()) {
      return await MongooseJob.create(data);
    }

    const jobs = readJobsFromFile();
    const now = new Date().toISOString();
    const newJob = {
      _id: 'job_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    jobs.push(newJob);
    writeJobsToFile(jobs);
    return createJobInstance(newJob);
  },

  insertMany: async (dataArray) => {
    if (getIsConnected()) {
      return await MongooseJob.insertMany(dataArray);
    }

    const jobs = readJobsFromFile();
    const inserted = dataArray.map((item, index) => {
      const now = new Date().toISOString();
      return {
        _id: 'job_' + Date.now().toString(36) + index.toString(36) + Math.random().toString(36).substr(2, 4),
        ...item,
        appliedDate: item.appliedDate ? new Date(item.appliedDate).toISOString() : now,
        interviewDate: item.interviewDate ? new Date(item.interviewDate).toISOString() : null,
        createdAt: now,
        updatedAt: now,
      };
    });

    const combined = [...jobs, ...inserted];
    writeJobsToFile(combined);
    return inserted.map(createJobInstance);
  },

  findByIdAndUpdate: async (id, updates, options = {}) => {
    if (getIsConnected()) {
      return await MongooseJob.findByIdAndUpdate(id, updates, options);
    }

    const jobs = readJobsFromFile();
    const index = jobs.findIndex((j) => j._id === id);
    if (index === -1) return null;

    const updated = {
      ...jobs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    jobs[index] = updated;
    writeJobsToFile(jobs);
    return createJobInstance(updated);
  },

  deleteMany: async (query = {}) => {
    if (getIsConnected()) {
      return await MongooseJob.deleteMany(query);
    }
    writeJobsToFile([]);
    return { acknowledged: true, deletedCount: 0 };
  },

  JobStatusEnum,
  EmploymentTypeEnum,
  WorkModeEnum,
};

module.exports = JobProxy;
