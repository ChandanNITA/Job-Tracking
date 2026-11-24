const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('./config/db');
const Job = require('./models/job.model');

dotenv.config({ path: require('path').join(__dirname, '.env') });

const sampleJobs = [
  {
    company: 'Google',
    role: 'Frontend Engineer (Angular / TypeScript)',
    location: 'Mountain View, CA (Hybrid)',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    jobLink: 'https://careers.google.com/jobs/results/123456',
    appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    status: 'Interview Scheduled',
    expectedSalary: 165000,
    interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    notes: 'Technical screen on Angular core, RxJS state management, and web performance optimization.',
  },
  {
    company: 'Microsoft',
    role: 'Software Development Engineer II',
    location: 'Redmond, WA (Hybrid)',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    jobLink: 'https://careers.microsoft.com/us/en/job/987654',
    appliedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    status: 'Offer Received',
    expectedSalary: 175000,
    interviewDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: 'Received written offer! Base $155k + bonus + RSUs. Reviewing offer letter and benefits.',
  },
  {
    company: 'Amazon Web Services (AWS)',
    role: 'Frontend Developer',
    location: 'Seattle, WA (On-site)',
    employmentType: 'Full-time',
    workMode: 'On-site',
    jobLink: 'https://amazon.jobs/en/jobs/246810',
    appliedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    status: 'Interview Scheduled',
    expectedSalary: 160000,
    interviewDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    notes: 'System design interview focusing on distributed cloud dashboards and low-latency rendering.',
  },
  {
    company: 'Stripe',
    role: 'Full Stack Engineer (Payments UI)',
    location: 'San Francisco, CA (Remote)',
    employmentType: 'Full-time',
    workMode: 'Remote',
    jobLink: 'https://stripe.com/jobs/listing/456789',
    appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'Applied',
    expectedSalary: 180000,
    interviewDate: null,
    notes: 'Applied via employee referral from University alumni. Waiting on recruiter initial reachout.',
  },
  {
    company: 'Netflix',
    role: 'Senior UI Platform Engineer',
    location: 'Los Gatos, CA (Remote)',
    employmentType: 'Full-time',
    workMode: 'Remote',
    jobLink: 'https://jobs.netflix.com/jobs/112233',
    appliedDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    status: 'Rejected',
    expectedSalary: 210000,
    interviewDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    notes: 'Passed screening, completed take-home project. Decided to proceed with internal candidate.',
  },
  {
    company: 'Atlassian',
    role: 'Frontend Architect',
    location: 'Austin, TX (Remote)',
    employmentType: 'Full-time',
    workMode: 'Remote',
    jobLink: 'https://www.atlassian.com/company/careers/details/554433',
    appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'Applied',
    expectedSalary: 170000,
    interviewDate: null,
    notes: 'Applied through LinkedIn Easy Apply. Position focuses on design systems and Jira micro-frontends.',
  },
  {
    company: 'Bloomberg LP',
    role: 'Angular Web Applications Developer',
    location: 'New York, NY (Hybrid)',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    jobLink: 'https://careers.bloomberg.com/job/detail/667788',
    appliedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    status: 'Interview Scheduled',
    expectedSalary: 155000,
    interviewDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    notes: 'Round 1 technical phone interview: reactive streams, charts rendering, memory management.',
  },
  {
    company: 'Spotify',
    role: 'Web Platform Intern',
    location: 'New York, NY (Hybrid)',
    employmentType: 'Internship',
    workMode: 'Hybrid',
    jobLink: 'https://www.lifeatspotify.com/jobs/998877',
    appliedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: 'Offer Received',
    expectedSalary: 95000,
    interviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    notes: 'Summer engineering internship offer received! Hourly equivalent approx $48/hr.',
  },
  {
    company: 'Airbnb',
    role: 'Software Engineer - Guest Experience',
    location: 'San Francisco, CA (Remote)',
    employmentType: 'Full-time',
    workMode: 'Remote',
    jobLink: 'https://careers.airbnb.com/positions/334455',
    appliedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    status: 'Rejected',
    expectedSalary: 165000,
    interviewDate: null,
    notes: 'Automated rejection email after resume review. Role was put on immediate hiring freeze.',
  },
  {
    company: 'Datadog',
    role: 'Frontend Engineer - APM Dashboards',
    location: 'Boston, MA (Remote)',
    employmentType: 'Full-time',
    workMode: 'Remote',
    jobLink: 'https://www.datadoghq.com/careers/detail/778899',
    appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'Applied',
    expectedSalary: 150000,
    interviewDate: null,
    notes: 'Submitted customized cover letter emphasizing real-time time-series data visualization and Canvas/WebGL.',
  },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing job records...');
    await Job.deleteMany({});

    console.log('[Seed] Inserting 10 realistic job applications...');
    const inserted = await Job.insertMany(sampleJobs);
    console.log(`[Seed] Successfully seeded ${inserted.length} job applications!`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
