#!/usr/bin/env node
/**
 * E2E test for agentic-service Examples page.
 * Uses agent-control to navigate the admin UI and verify each example.
 * 
 * Prerequisites:
 * - agentic-service running on port 1234
 * - agent-control available globally
 * 
 * Tests:
 * 1. Chat Playground — send message, verify LLM response
 * 2. Agent Sandbox — send message via /v1/chat/completions, verify response
 * 3. TTS Lab — submit text, expect OPENAI_API_KEY error (no key configured)
 * 4. Transcription Studio — verify UI renders (file upload needed)
 * 5. Live Talk — verify UI renders (audio input needed)
 * 6. Voice One-Shot — verify UI renders (audio input needed)
 */

import { execSync } from 'child_process';
import { spawn } from 'child_process';
import http from 'http';

const PORT = 1234;
const BASE = `http://localhost:${PORT}`;
const RESULTS = [];
let serverProc = null;

function ac(cmd) {
  try {
    const out = execSync(`agent-control -p web ${cmd}`, {
      encoding: 'utf8', timeout: 20000, stdio: ['pipe', 'pipe', 'pipe']
    });
    try { return JSON.parse(out); } catch { return out.trim(); }
  } catch (e) {
    return { error: e.message, stdout: e.stdout?.slice(0, 200) };
  }
}

function snapshot() {
  try {
    const out = execSync('agent-control -p web snapshot', {
      encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(out);
  } catch { return []; }
}

function findRef(elements, match) {
  for (const el of elements) {
    if (typeof match === 'string' && (el.label || '').includes(match)) return el.ref;
    if (typeof match === 'function' && match(el)) return el.ref;
  }
  return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function pass(name, detail) { RESULTS.push({ name, status: 'pass', detail }); console.log(`  ✅ ${name}: ${detail}`); }
function fail(name, detail) { RESULTS.push({ name, status: 'fail', detail }); console.log(`  ❌ ${name}: ${detail}`); }

async function waitForServer(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`${BASE}/health`, res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => resolve(d));
        });
        req.on('error', reject);
        req.setTimeout(2000, () => { req.destroy(); reject(new Error('timeout')); });
      });
      return true;
    } catch { await sleep(1000); }
  }
  return false;
}

async function startServer() {
  // Check if already running
  try {
    const res = await new Promise((resolve, reject) => {
      http.get(`${BASE}/health`, r => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>resolve(d)); }).on('error', reject);
    });
    if (res.includes('ok')) { console.log('[e2e] Server already running'); return; }
  } catch {}

  console.log('[e2e] Starting agentic-service...');
  serverProc = spawn('node', ['bin/agentic-service.js', '--skip-setup', '--no-browser', '-p', String(PORT)], {
    cwd: process.cwd(),
    stdio: 'pipe',
    detached: false
  });
  serverProc.stderr.on('data', d => {});
  
  if (!await waitForServer()) {
    throw new Error('Server failed to start within 15s');
  }
  console.log('[e2e] Server ready');
}

// --- Test functions ---

async function testChatPlayground() {
  const name = 'Chat Playground';
  try {
    // Navigate to examples
    ac(`navigate "${BASE}"`);
    await sleep(2000);

    // Click Examples tab
    let els = snapshot();
    const exRef = findRef(els, '🎮Examples');
    if (!exRef) { fail(name, 'Examples tab not found'); return; }
    ac(`click ${exRef}`);
    await sleep(1500);

    // Click Chat Playground card
    els = snapshot();
    const chatRef = findRef(els, el => (el.label || '').includes('Chat Playground') && el.w < 300);
    if (!chatRef) { fail(name, 'Chat Playground card not found'); return; }
    ac(`click ${chatRef}`);
    await sleep(1500);

    // Find input and send
    els = snapshot();
    const inputRef = findRef(els, el => el.tag === 'input' && (el.placeholder || '') === '输入消息...');
    if (!inputRef) { fail(name, 'Input field not found'); return; }
    ac(`fill ${inputRef} "say hello in one word"`);
    await sleep(500);

    const sendRef = findRef(snapshot(), el => el.tag === 'button' && (el.label || '') === '发送');
    if (!sendRef) { fail(name, 'Send button not found'); return; }
    ac(`click ${sendRef}`);
    await sleep(8000);

    // Check response
    els = snapshot();
    const hasResponse = els.some(el => 
      el.tag === 'div' && el.label && el.label.length > 5 && 
      !el.label.includes('Chat Playground') && !el.label.includes('say hello')
    );
    
    // Also check for assistant message in the chat
    const responseEl = els.find(el => {
      const l = (el.label || '').toLowerCase();
      return l.includes('hello') || l.includes('hi') || l.includes('hey');
    });

    if (responseEl) {
      pass(name, `Got response: "${(responseEl.label || '').slice(0, 80)}"`);
    } else {
      fail(name, 'No LLM response detected in chat');
    }

    // Close panel
    const closeRef = findRef(snapshot(), el => el.tag === 'button' && el.label === '✕');
    if (closeRef) ac(`click ${closeRef}`);
    await sleep(500);
  } catch (e) {
    fail(name, e.message);
  }
}

async function testAgentSandbox() {
  const name = 'Agent Sandbox';
  try {
    let els = snapshot();
    const cardRef = findRef(els, el => (el.label || '').includes('Agent Sandbox') && el.w < 300);
    if (!cardRef) { fail(name, 'Card not found'); return; }
    ac(`click ${cardRef}`);
    await sleep(1500);

    els = snapshot();
    const inputRef = findRef(els, el => el.tag === 'input' && (el.placeholder || '') === '输入消息...');
    if (!inputRef) { fail(name, 'Input not found'); return; }
    ac(`fill ${inputRef} "what is 2+2"`);
    await sleep(500);

    const callRef = findRef(snapshot(), el => el.tag === 'button' && (el.label || '') === '调用');
    if (!callRef) { fail(name, 'Call button not found'); return; }
    ac(`click ${callRef}`);
    await sleep(8000);

    els = snapshot();
    const responseEl = els.find(el => {
      const l = (el.label || '').toLowerCase();
      return l.includes('4') || l.includes('four');
    });

    if (responseEl) {
      pass(name, `Got response containing "4": "${(responseEl.label || '').slice(0, 80)}"`);
    } else {
      fail(name, 'No response with "4" found');
    }

    const closeRef = findRef(snapshot(), el => el.tag === 'button' && el.label === '✕');
    if (closeRef) ac(`click ${closeRef}`);
    await sleep(500);
  } catch (e) {
    fail(name, e.message);
  }
}

async function testTTSLab() {
  const name = 'TTS Lab';
  try {
    let els = snapshot();
    const cardRef = findRef(els, el => (el.label || '').includes('TTS Lab') && el.w < 300);
    if (!cardRef) { fail(name, 'Card not found'); return; }
    ac(`click ${cardRef}`);
    await sleep(1500);

    els = snapshot();
    const inputRef = findRef(els, el => el.tag === 'input' && el.type === 'text');
    if (!inputRef) { fail(name, 'Input not found'); return; }
    ac(`fill ${inputRef} "hello"`);
    await sleep(500);

    const synthRef = findRef(snapshot(), el => el.tag === 'button' && (el.label || '') === '合成');
    if (!synthRef) { fail(name, 'Synth button not found'); return; }
    ac(`click ${synthRef}`);
    await sleep(5000);

    els = snapshot();
    // Expect error since no OPENAI_API_KEY
    const errorEl = els.find(el => (el.label || '').includes('OPENAI_API_KEY') || (el.label || '').includes('失败'));
    if (errorEl) {
      pass(name, 'Expected error: OPENAI_API_KEY not set (no local TTS adapter)');
    } else {
      // Maybe TTS actually worked?
      const audioEl = els.find(el => el.tag === 'audio');
      if (audioEl) {
        pass(name, 'TTS produced audio output');
      } else {
        fail(name, 'No error or audio output detected');
      }
    }

    const closeRef = findRef(snapshot(), el => el.tag === 'button' && el.label === '✕');
    if (closeRef) ac(`click ${closeRef}`);
    await sleep(500);
  } catch (e) {
    fail(name, e.message);
  }
}

async function testTranscriptionStudio() {
  const name = 'Transcription Studio';
  try {
    let els = snapshot();
    const cardRef = findRef(els, el => (el.label || '').includes('Transcription') && el.w < 300);
    if (!cardRef) { fail(name, 'Card not found'); return; }
    ac(`click ${cardRef}`);
    await sleep(1500);

    els = snapshot();
    const hasFileInput = els.some(el => el.tag === 'input' && el.type === 'file');
    const hasButton = els.some(el => el.tag === 'button' && (el.label || '') === '转写');

    if (hasFileInput && hasButton) {
      pass(name, 'UI renders correctly (file input + transcribe button)');
    } else {
      fail(name, `Missing elements: fileInput=${hasFileInput}, button=${hasButton}`);
    }

    const closeRef = findRef(snapshot(), el => el.tag === 'button' && el.label === '✕');
    if (closeRef) ac(`click ${closeRef}`);
    await sleep(500);
  } catch (e) {
    fail(name, e.message);
  }
}

async function testLiveTalk() {
  const name = 'Live Talk';
  try {
    let els = snapshot();
    const cardRef = findRef(els, el => (el.label || '').includes('Live Talk') && el.w < 300);
    if (!cardRef) { fail(name, 'Card not found'); return; }
    ac(`click ${cardRef}`);
    await sleep(1500);

    els = snapshot();
    const hasFileInput = els.some(el => el.tag === 'input' && el.type === 'file');
    const hasButton = els.some(el => el.tag === 'button' && (el.label || '').includes('STT'));

    if (hasFileInput && hasButton) {
      pass(name, 'UI renders correctly (file input + STT→LLM→TTS button)');
    } else {
      fail(name, `Missing elements: fileInput=${hasFileInput}, button=${hasButton}`);
    }

    const closeRef = findRef(snapshot(), el => el.tag === 'button' && el.label === '✕');
    if (closeRef) ac(`click ${closeRef}`);
    await sleep(500);
  } catch (e) {
    fail(name, e.message);
  }
}

async function testVoiceOneShot() {
  const name = 'Voice One-Shot';
  try {
    let els = snapshot();
    const cardRef = findRef(els, el => (el.label || '').includes('Voice One-Shot') && el.w < 300);
    if (!cardRef) { fail(name, 'Card not found'); return; }
    ac(`click ${cardRef}`);
    await sleep(1500);

    els = snapshot();
    const hasFileInput = els.some(el => el.tag === 'input' && el.type === 'file');
    const hasButton = els.some(el => el.tag === 'button' && (el.label || '') === '发送');

    if (hasFileInput && hasButton) {
      pass(name, 'UI renders correctly (file input + send button)');
    } else {
      fail(name, `Missing elements: fileInput=${hasFileInput}, button=${hasButton}`);
    }

    const closeRef = findRef(snapshot(), el => el.tag === 'button' && el.label === '✕');
    if (closeRef) ac(`click ${closeRef}`);
    await sleep(500);
  } catch (e) {
    fail(name, e.message);
  }
}

// --- API-level tests ---

async function testAPIChat() {
  const name = 'API /api/chat';
  try {
    const body = JSON.stringify({ message: 'say hi', history: [] });
    const data = await new Promise((resolve, reject) => {
      const req = http.request(`${BASE}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(d));
      });
      req.on('error', reject);
      req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
      req.write(body);
      req.end();
    });

    const hasContent = data.includes('"type":"content"');
    const hasDone = data.includes('[DONE]');
    if (hasContent && hasDone) {
      const texts = data.split('\n').filter(l => l.startsWith('data: ') && !l.includes('[DONE]'))
        .map(l => { try { return JSON.parse(l.slice(6)).text; } catch { return ''; } })
        .join('');
      pass(name, `SSE stream OK, response: "${texts.slice(0, 60)}"`);
    } else {
      fail(name, `Missing content or DONE marker. Response: ${data.slice(0, 200)}`);
    }
  } catch (e) {
    fail(name, e.message);
  }
}

async function testAPICompletions() {
  const name = 'API /v1/chat/completions';
  try {
    const body = JSON.stringify({ model: 'gemma4:26b', messages: [{ role: 'user', content: 'say ok' }], stream: false });
    const data = await new Promise((resolve, reject) => {
      const req = http.request(`${BASE}/v1/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(d));
      });
      req.on('error', reject);
      req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
      req.write(body);
      req.end();
    });

    const parsed = JSON.parse(data);
    if (parsed.choices?.[0]?.message?.content) {
      pass(name, `Response: "${parsed.choices[0].message.content.slice(0, 60)}"`);
    } else {
      fail(name, `Unexpected response: ${data.slice(0, 200)}`);
    }
  } catch (e) {
    fail(name, e.message);
  }
}

// --- Main ---

async function main() {
  console.log('\n🧪 Agentic Service E2E Tests\n');

  await startServer();

  // API tests first (faster, no UI)
  console.log('\n📡 API Tests:');
  await testAPIChat();
  await testAPICompletions();

  // UI tests via agent-control
  console.log('\n🖥️  UI Tests (agent-control):');
  await testChatPlayground();
  await testAgentSandbox();
  await testTTSLab();
  await testTranscriptionStudio();
  await testLiveTalk();
  await testVoiceOneShot();

  // Summary
  const passed = RESULTS.filter(r => r.status === 'pass').length;
  const failed = RESULTS.filter(r => r.status === 'fail').length;
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`📊 Results: ${passed} passed, ${failed} failed, ${RESULTS.length} total`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    RESULTS.filter(r => r.status === 'fail').forEach(r => console.log(`  ❌ ${r.name}: ${r.detail}`));
  }

  // Write results for team tester to read
  const reportPath = '.team/verify-errors/latest-e2e.log';
  const { mkdirSync, writeFileSync } = await import('fs');
  mkdirSync('.team/verify-errors', { recursive: true });
  writeFileSync(reportPath, RESULTS.map(r => `${r.status === 'pass' ? '✅' : '❌'} ${r.name}: ${r.detail}`).join('\n'));

  if (serverProc) { serverProc.kill(); }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
