import { describe, it, expect, vi, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import request from 'supertest';
import { createApp } from '../src/server/api.js';

const app = createApp();

afterEach(() => vi.restoreAllMocks());

describe('POST /api/transcribe invalid format', () => {
  it('returns 400 when no audio file', async () => {
    const res = await request(app).post('/api/transcribe').send({ audio: 'bad' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/config disk write failure', () => {
  it('returns 500 on write error', async () => {
    vi.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error('disk full'));
    const res = await request(app).put('/api/config').send({ llm: {} });
    expect(res.status).toBe(500);
  });
});
