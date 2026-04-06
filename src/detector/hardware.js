import os from 'node:os';
import { detectGPU } from './gpu-detector.js';

/**
 * 检测硬件信息
 * @returns {Promise<{platform: string, arch: string, gpu: {type: string, vram: number}, memory: number, cpu: {cores: number, model: string}}>}
 */
export async function detect() {
  try {
    const platform = os.platform();
    const arch = os.arch();

    // 并行检测
    const [gpu, cpu, memory] = await Promise.all([
      detectGPU(platform),
      Promise.resolve(getCPUInfo()),
      Promise.resolve(getMemoryInfo())
    ]);

    return { platform, arch, gpu, memory, cpu };
  } catch (error) {
    console.error('Hardware detection failed:', error);
    // 返回最小可用信息
    return {
      platform: os.platform(),
      arch: os.arch(),
      gpu: { type: 'none', vram: 0 },
      memory: Math.round(os.totalmem() / (1024 ** 3)),
      cpu: { cores: os.cpus().length, model: 'unknown' }
    };
  }
}

/**
 * 获取 CPU 信息
 * @returns {{cores: number, model: string}}
 */
function getCPUInfo() {
  const cpus = os.cpus();
  return {
    cores: cpus.length,
    model: cpus[0].model
  };
}

/**
 * 获取内存信息（GB）
 * @returns {number}
 */
function getMemoryInfo() {
  const totalMem = os.totalmem();
  return Math.round(totalMem / (1024 ** 3));
}
