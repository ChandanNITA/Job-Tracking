const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Spawning backend server...');
const serverProcess = spawn('node', ['backend/server.js'], { stdio: 'inherit' });

function waitForServer(retries = 15) {
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get('http://localhost:5000/api/health', (res) => {
        if (res.statusCode === 200) {
          console.log('Server is ready!');
          resolve();
        } else if (retries > 0) {
          retries--;
          setTimeout(check, 500);
        } else {
          reject(new Error('Server failed to start'));
        }
      });
      req.on('error', () => {
        if (retries > 0) {
          retries--;
          setTimeout(check, 500);
        } else {
          reject(new Error('Server failed to respond'));
        }
      });
    };
    check();
  });
}

waitForServer()
  .then(() => {
    console.log('Running test suite...');
    const testProcess = spawn('node', ['backend/test-api.js'], { stdio: 'inherit' });
    testProcess.on('exit', (code) => {
      console.log(`Tests finished with exit code: ${code}`);
      serverProcess.kill();
      process.exit(code);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to server:', err);
    serverProcess.kill();
    process.exit(1);
  });
