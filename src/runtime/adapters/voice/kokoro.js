export async function synthesize() {
  throw Object.assign(new Error('kokoro not available'), { code: 'NOT_AVAILABLE' });
}
