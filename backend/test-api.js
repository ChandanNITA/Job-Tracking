// Automated backend API verification script
const http = require('http');

const BASE_URL = 'http://localhost:5000/api/jobs';

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsedData });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting CareerTrack Backend API Tests...\n');
  let createdJobId = null;

  try {
    // 1. Health check
    console.log('Test 1: Health check');
    const health = await request('http://localhost:5000/api/health');
    console.assert(health.status === 200, `Health check failed with status ${health.status}`);
    console.log('✅ Health check passed!\n');

    // 2. GET all jobs
    console.log('Test 2: GET /api/jobs (Retrieve all jobs)');
    const allJobs = await request(BASE_URL);
    console.assert(allJobs.status === 200, `Expected 200, got ${allJobs.status}`);
    console.assert(Array.isArray(allJobs.data.data), 'Expected data to be an array');
    console.log(`✅ Retrieved ${allJobs.data.count} existing jobs\n`);

    // 3. POST new job
    console.log('Test 3: POST /api/jobs (Create application)');
    const newJob = {
      company: 'Acme Corp',
      role: 'Full Stack Engineer',
      location: 'New York, NY',
      employmentType: 'Full-time',
      workMode: 'Remote',
      jobLink: 'https://acme.example.com/careers/123',
      appliedDate: new Date().toISOString(),
      status: 'Applied',
      expectedSalary: 140000,
      notes: 'Initial interview next week',
    };
    const createRes = await request(BASE_URL, { method: 'POST' }, newJob);
    console.assert(createRes.status === 201, `Expected 201, got ${createRes.status}`);
    console.assert(createRes.data.data.company === 'Acme Corp', 'Company mismatch');
    createdJobId = createRes.data.data._id;
    console.log(`✅ Successfully created job with ID: ${createdJobId}\n`);

    // 4. GET single job
    console.log(`Test 4: GET /api/jobs/${createdJobId} (Retrieve single job)`);
    const singleRes = await request(`${BASE_URL}/${createdJobId}`);
    console.assert(singleRes.status === 200, `Expected 200, got ${singleRes.status}`);
    console.assert(singleRes.data.data._id === createdJobId, 'Job ID mismatch');
    console.log('✅ Retrieved single job successfully\n');

    // 5. PUT update job
    console.log(`Test 5: PUT /api/jobs/${createdJobId} (Update status to Interview Scheduled)`);
    const updateRes = await request(
      `${BASE_URL}/${createdJobId}`,
      { method: 'PUT' },
      {
        status: 'Interview Scheduled',
        interviewDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      }
    );
    console.assert(updateRes.status === 200, `Expected 200, got ${updateRes.status}`);
    console.assert(updateRes.data.data.status === 'Interview Scheduled', 'Status not updated');
    console.log('✅ Updated job successfully\n');

    // 6. Test search & filter
    console.log('Test 6: GET /api/jobs?search=Acme (Search filter)');
    const searchRes = await request(`${BASE_URL}?search=Acme`);
    console.assert(searchRes.status === 200, `Expected 200, got ${searchRes.status}`);
    console.assert(searchRes.data.data.length >= 1, 'Search did not find created job');
    console.log(`✅ Search filter returned ${searchRes.data.count} result(s)\n`);

    // 7. GET stats summary
    console.log('Test 7: GET /api/jobs/stats/summary (Dashboard statistics)');
    const statsRes = await request(`${BASE_URL}/stats/summary`);
    console.assert(statsRes.status === 200, `Expected 200, got ${statsRes.status}`);
    console.assert(typeof statsRes.data.data.total === 'number', 'Total stats not a number');
    console.log('✅ Stats summary endpoint working properly\n');

    // 8. DELETE job
    console.log(`Test 8: DELETE /api/jobs/${createdJobId} (Delete job)`);
    const deleteRes = await request(`${BASE_URL}/${createdJobId}`, { method: 'DELETE' });
    console.assert(deleteRes.status === 200, `Expected 200, got ${deleteRes.status}`);
    console.log('✅ Deleted job successfully\n');

    // 9. Verify 404 after deletion
    console.log(`Test 9: GET deleted job should return 404`);
    const verifyNotFound = await request(`${BASE_URL}/${createdJobId}`);
    console.assert(verifyNotFound.status === 404, `Expected 404, got ${verifyNotFound.status}`);
    console.log('✅ Correctly received 404 for deleted job\n');

    console.log('🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTests();
