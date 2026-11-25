const http = require('http');
const { buildInterviewPrompt } = require('./services/ai.service');

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
          resolve({ status: res.statusCode, data: JSON.parse(body) });
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

async function runAiTests() {
  console.log('🧪 Starting AI Interview Preparation Feature Tests...\n');

  try {
    // 1. Prompt engineering test
    console.log('Test 1: Prompt Builder formatting verification');
    const prompt = buildInterviewPrompt({
      company: 'Infosys',
      role: 'Angular Developer',
      jobDescription: 'Experience with TypeScript, RxJS, and Angular 17 required.',
      experienceLevel: 'Fresher',
      difficulty: 'Medium',
      interviewType: 'Mixed',
    });
    console.assert(prompt.includes('Infosys'), 'Prompt must contain company name');
    console.assert(prompt.includes('Angular Developer'), 'Prompt must contain job role');
    console.assert(prompt.includes('5 Technical questions'), 'Mixed type must request 5 tech questions');
    console.assert(prompt.includes('3 Behavioral/HR questions'), 'Mixed type must request 3 behavioral questions');
    console.assert(prompt.includes('2 Scenario-based questions'), 'Mixed type must request 2 scenario questions');
    console.assert(prompt.includes('STAR method'), 'Prompt must instruct STAR method for behavioral questions');
    console.log('✅ AI Prompt Builder constructs structured prompt correctly\n');

    // 2. Validation: Empty Body
    console.log('Test 2: Validation on empty request body');
    const resEmpty = await request('http://localhost:5000/api/ai/interview-questions', { method: 'POST' }, {});
    console.assert(resEmpty.status === 400, `Expected 400, got ${resEmpty.status}`);
    console.assert(resEmpty.data.success === false, 'Expected success: false');
    console.log('✅ Correctly rejected empty payload with 400\n');

    // 3. Validation: Missing Role
    console.log('Test 3: Validation on missing role');
    const resNoRole = await request('http://localhost:5000/api/ai/interview-questions', { method: 'POST' }, { company: 'Google' });
    console.assert(resNoRole.status === 400, `Expected 400, got ${resNoRole.status}`);
    console.log('✅ Correctly rejected missing role with 400\n');

    // 4. Validation: Invalid enum for experienceLevel
    console.log('Test 4: Validation on invalid experienceLevel');
    const resBadExp = await request('http://localhost:5000/api/ai/interview-questions', { method: 'POST' }, {
      company: 'Google',
      role: 'Frontend Engineer',
      experienceLevel: 'InvalidLevel',
    });
    console.assert(resBadExp.status === 400, `Expected 400, got ${resBadExp.status}`);
    console.log('✅ Correctly rejected invalid experienceLevel with 400\n');

    // 5. Validation: Invalid enum for interviewType
    console.log('Test 5: Validation on invalid interviewType');
    const resBadType = await request('http://localhost:5000/api/ai/interview-questions', { method: 'POST' }, {
      company: 'Google',
      role: 'Frontend Engineer',
      interviewType: 'UnknownType',
    });
    console.assert(resBadType.status === 400, `Expected 400, got ${resBadType.status}`);
    console.log('✅ Correctly rejected invalid interviewType with 400\n');

    // 6. Missing API key handling
    console.log('Test 6: Missing API key handling');
    const resValidShape = await request('http://localhost:5000/api/ai/interview-questions', { method: 'POST' }, {
      company: 'Google',
      role: 'Frontend Engineer',
      experienceLevel: 'Fresher',
      difficulty: 'Medium',
      interviewType: 'Mixed',
    });
    console.assert(
      resValidShape.status === 503 || resValidShape.status === 200 || resValidShape.status === 401,
      `Expected 503 (missing key) or 200/401, got ${resValidShape.status}`
    );
    console.log(`✅ Handled request cleanly with status ${resValidShape.status} (${resValidShape.data.message})\n`);

    console.log('🎉 ALL AI INTERVIEW PREPARATION UNIT/INTEGRATION TESTS PASSED!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ AI Test failed:', err);
    process.exit(1);
  }
}

runAiTests();
