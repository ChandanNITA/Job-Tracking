const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const { execFile } = require('child_process');
const { chromium } = require('playwright');
const ffmpegPath = require('ffmpeg-static');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const TEMP_VIDEO_DIR = path.join(ROOT_DIR, 'temp_video');

if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
if (!fs.existsSync(TEMP_VIDEO_DIR)) fs.mkdirSync(TEMP_VIDEO_DIR, { recursive: true });

// Load backend environment variables
require('dotenv').config({ path: path.join(ROOT_DIR, 'backend', '.env') });
process.env.PORT = '5001';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start backend and static frontend server
async function startServers() {
  console.log('Starting backend & frontend proxy server on ports 5001 & 4200...');

  // 1. Backend Server
  const backendApp = require(path.join(ROOT_DIR, 'backend', 'server'));
  
  // 2. Frontend Server on 4200 with proxy to /api
  const frontendApp = express();
  const distPath = path.join(ROOT_DIR, 'frontend', 'dist', 'careertrack-frontend', 'browser');

  frontendApp.use('/api', (req, res) => {
    const backendPort = 5001;
    const options = {
      hostname: '127.0.0.1',
      port: backendPort,
      path: req.originalUrl,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${backendPort}` }
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });
    proxyReq.on('error', (err) => {
      res.status(500).json({ error: 'Proxy error: ' + err.message });
    });
  });

  frontendApp.use(express.static(distPath));
  frontendApp.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  const frontendServer = await new Promise((resolve) => {
    const s = frontendApp.listen(4200, () => {
      console.log('Frontend server live at http://localhost:4200');
      resolve(s);
    });
  });

  return { backendApp, frontendServer };
}

// Injects floating caption banner into browser page
async function showCaption(page, text, durationMs = 2500) {
  console.log(`[Caption]: ${text}`);
  await page.evaluate((captionText) => {
    let el = document.getElementById('demo-caption-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-caption-overlay';
      document.body.appendChild(el);

      const style = document.createElement('style');
      style.textContent = `
        #demo-caption-overlay {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.94);
          backdrop-filter: blur(12px);
          color: #ffffff;
          padding: 12px 28px;
          border-radius: 9999px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.2px;
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15);
          z-index: 999999;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          gap: 12px;
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }
    el.innerHTML = `
      <span style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:linear-gradient(135deg, #4f46e5, #06b6d4); box-shadow:0 0 10px rgba(79,70,229,0.5); font-size:11px;">✨</span>
      <span>${captionText}</span>
    `;
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  }, text);

  if (durationMs > 0) {
    await sleep(durationMs);
  }
}

async function smoothScroll(page, targetY, durationMs = 1200) {
  await page.evaluate(({ targetY, durationMs }) => {
    return new Promise((resolve) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // easeInOutQuad
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        window.scrollTo(0, startY + diff * ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { targetY, durationMs });
  await sleep(400);
}

// Convert video using ffmpeg
function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    console.log(`Running ffmpeg: ${args.join(' ')}`);
    execFile(ffmpegPath, args, (err, stdout, stderr) => {
      if (err) {
        console.error('ffmpeg error:', stderr);
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

async function main() {
  const { frontendServer, backendApp } = await startServers();

  console.log('Launching browser with video recording...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--window-size=1920,1080', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: TEMP_VIDEO_DIR,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  try {
    // 1. INTRO & DASHBOARD
    console.log('Navigating to Dashboard...');
    await page.goto('http://localhost:4200/dashboard', { waitUntil: 'networkidle' });
    await sleep(1500);

    await showCaption(page, 'CareerTrack — Full-Stack Job Application Tracker', 2500);
    await showCaption(page, 'Executive Analytics Dashboard with Real-Time Metrics & Charts', 2500);

    // Save actual dashboard screenshot as thumbnail.png
    const thumbnailPath = path.join(DOCS_DIR, 'thumbnail.png');
    await page.screenshot({ path: thumbnailPath, fullPage: false });
    console.log(`Thumbnail saved to: ${thumbnailPath}`);

    // Scroll down to showcase charts
    await smoothScroll(page, 520, 1500);
    await sleep(1500);
    await smoothScroll(page, 950, 1200);
    await sleep(1500);
    await smoothScroll(page, 0, 1000);
    await sleep(800);

    // 2. ALL APPLICATIONS & FILTERING
    console.log('Navigating to All Applications...');
    await page.click('a[href="/applications"]');
    await page.waitForURL('**/applications');
    await sleep(1200);

    await showCaption(page, 'Comprehensive Application Pipeline with Real-Time Search & Filtering', 2500);

    // Test real-time search
    const searchInput = page.locator('input[placeholder*="Search by company"]');
    if (await searchInput.count() > 0) {
      await searchInput.click();
      await searchInput.fill('Angular');
      await sleep(1800);
      await searchInput.fill('');
      await sleep(1000);
    }

    // Test status filter
    const statusSelect = page.locator('select').first();
    if (await statusSelect.count() > 0) {
      await statusSelect.selectOption('Interview Scheduled');
      await sleep(1800);
      await statusSelect.selectOption('All');
      await sleep(1200);
    }

    // 3. KANBAN BOARD VIEW
    console.log('Switching to Kanban Board view...');
    const kanbanButton = page.locator('button:has-text("Kanban")');
    if (await kanbanButton.count() > 0) {
      await kanbanButton.click();
      await sleep(1200);
      await showCaption(page, 'Dynamic Kanban Board with Visual Recruitment Stages', 2800);
      await smoothScroll(page, 200, 800);
      await sleep(1500);
      await smoothScroll(page, 0, 600);
      await sleep(800);
      
      // Switch back to table
      const tableButton = page.locator('button:has-text("Table")');
      if (await tableButton.count() > 0) {
        await tableButton.click();
        await sleep(1000);
      }
    }

    // 4. ADD NEW APPLICATION
    console.log('Navigating to Add Application...');
    await page.click('a[href="/applications/add"]');
    await page.waitForURL('**/applications/add');
    await sleep(1200);

    await showCaption(page, 'Reactive Form Validation & Job Application Submission', 2500);

    await page.fill('#company', 'Google');
    await sleep(300);
    await page.fill('#role', 'Senior Frontend Engineer (Angular)');
    await sleep(300);
    await page.selectOption('#status', 'Applied');
    await sleep(300);
    await page.selectOption('#workMode', 'Hybrid');
    await sleep(300);
    await page.fill('#location', 'Mountain View, CA');
    await sleep(300);
    await page.fill('#salary', '$185,000');
    await sleep(300);
    await page.fill('#jobDescription', 'Lead frontend architecture for developer tools using modern Angular 17, TypeScript, RxJS, and scalable component systems.');
    await sleep(800);

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForURL('**/applications');
    await sleep(1500);

    // 5. INTERVIEW SCHEDULE
    console.log('Navigating to Interview Schedule...');
    await page.click('a[href="/interviews"]');
    await page.waitForURL('**/interviews');
    await sleep(1500);

    await showCaption(page, 'Upcoming Interview Schedule & Live Countdown Tracker', 2500);
    await sleep(1200);

    // 6. AI INTERVIEW PREPARATION (GOOGLE GEMINI API)
    console.log('Triggering AI Interview Preparation...');
    await page.click('a[href="/applications"]');
    await page.waitForURL('**/applications');
    await sleep(1200);

    // Click "Prepare with AI" button on first job row
    const aiPrepLink = page.locator('a:has-text("Prepare with AI")').first();
    await aiPrepLink.click();
    await page.waitForURL('**/interview-preparation');
    await sleep(1500);

    await showCaption(page, 'AI Interview Preparation Powered by Google Gemini Flash', 2800);

    // Configure preparation preferences
    const expSelect = page.locator('#experienceLevel');
    if (await expSelect.count() > 0) {
      await expSelect.selectOption('Mid-level');
      await sleep(400);
    }

    const diffSelect = page.locator('#difficulty');
    if (await diffSelect.count() > 0) {
      await diffSelect.selectOption('Medium');
      await sleep(400);
    }

    const typeSelect = page.locator('#interviewType');
    if (await typeSelect.count() > 0) {
      await typeSelect.selectOption('Mixed');
      await sleep(400);
    }

    // Generate Interview Questions
    console.log('Generating real interview questions via Gemini API...');
    await showCaption(page, 'Generating Tailored Questions, STAR Answers & Preparation Tips...', 2500);

    const generateBtn = page.locator('button[type="submit"]:has-text("Generate Interview Questions"), button[type="submit"]:has-text("Regenerate")');
    await generateBtn.click();

    // Wait for questions to be generated by Gemini
    await page.waitForSelector('app-interview-question-card', { timeout: 35000 });
    await sleep(1500);

    // 7. INTERACTIVE QUESTIONS & PROGRESS TRACKING
    await showCaption(page, 'Structured Questions with Expandable STAR Answers & Concepts', 2800);

    // Scroll to first question
    await smoothScroll(page, 450, 1000);
    await sleep(1000);

    // Expand answer on first question
    const firstQuestionCard = page.locator('app-interview-question-card').first();
    const showAnswerBtn = firstQuestionCard.locator('button:has-text("Show Answer")');
    if (await showAnswerBtn.count() > 0) {
      await showAnswerBtn.click();
      await sleep(1500);
    }

    // Click "Copy Answer"
    const copyBtn = firstQuestionCard.locator('button:has-text("Copy Answer")');
    if (await copyBtn.count() > 0) {
      await copyBtn.click();
      await sleep(1200);
    }

    // Mark as practiced
    await showCaption(page, 'Dynamic Preparation Progress Bar & Concept Revision', 2500);
    const practicedCheckbox = firstQuestionCard.locator('input[type="checkbox"]');
    if (await practicedCheckbox.count() > 0) {
      await practicedCheckbox.check();
      await sleep(1500);
    }

    // Scroll down to topics and tips
    await smoothScroll(page, 1100, 1200);
    await sleep(1800);

    // 8. RETURN TO DASHBOARD
    console.log('Returning to Dashboard...');
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard');
    await sleep(1500);

    await showCaption(page, 'CareerTrack — Empowering Your Engineering Career Journey', 3000);
    await sleep(1500);

  } catch (err) {
    console.error('Error during recording walkthrough:', err);
  } finally {
    console.log('Finalizing page and browser context...');
    await page.close();
    await context.close();
    await browser.close();

    // Close servers
    if (frontendServer) frontendServer.close();
    if (backendApp.server) backendApp.server.close();
  }

  // 9. VIDEO ENCODING & GIF CREATION
  console.log('Processing recorded video file with ffmpeg...');
  const recordedFiles = fs.readdirSync(TEMP_VIDEO_DIR).filter(f => f.endsWith('.webm'));
  if (recordedFiles.length === 0) {
    throw new Error('No recorded video file found in temp_video!');
  }

  const rawVideoPath = path.join(TEMP_VIDEO_DIR, recordedFiles[0]);
  const mp4Path = path.join(DOCS_DIR, 'demo.mp4');
  const gifPath = path.join(DOCS_DIR, 'demo.gif');

  // Convert to 1080p 30fps MP4
  console.log(`Encoding MP4: ${mp4Path}`);
  await runFfmpeg([
    '-y',
    '-i', rawVideoPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-b:v', '2500k',
    '-movflags', '+faststart',
    mp4Path
  ]);

  // Create high quality compressed GIF (~18 seconds focusing on key moments)
  console.log(`Creating optimized GIF: ${gifPath}`);
  await runFfmpeg([
    '-y',
    '-i', mp4Path,
    '-ss', '00:00:00',
    '-t', '18',
    '-vf', 'fps=12,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer',
    gifPath
  ]);

  // Cleanup temp webm files
  try {
    for (const f of recordedFiles) {
      fs.unlinkSync(path.join(TEMP_VIDEO_DIR, f));
    }
    fs.rmdirSync(TEMP_VIDEO_DIR);
  } catch (e) {
    console.warn('Temp cleanup notice:', e.message);
  }

  console.log('\n========================================');
  console.log('✅ Demo Recording & Processing Complete!');
  console.log(`📹 Video:     ${mp4Path}`);
  console.log(`🖼️  GIF:       ${gifPath}`);
  console.log(`📸 Thumbnail: ${path.join(DOCS_DIR, 'thumbnail.png')}`);
  console.log('========================================\n');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
