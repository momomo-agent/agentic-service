import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { access } from 'node:fs/promises';

const execAsync = promisify(exec);

/**
 * 检测 GPU 信息
 * @param {string} platform - 操作系统平台
 * @returns {Promise<{type: string, vram: number}>}
 */
export async function detectGPU(platform) {
  switch (platform) {
    case 'darwin':
      return detectMacGPU();
    case 'linux':
      return detectLinuxGPU();
    case 'win32':
      return detectWindowsGPU();
    default:
      return { type: 'none', vram: 0 };
  }
}

/**
 * macOS GPU 检测
 * @returns {Promise<{type: string, vram: number}>}
 */
async function detectMacGPU() {
  try {
    const { stdout } = await execAsync('system_profiler SPDisplaysDataType');

    // 检查 Apple Silicon
    if (stdout.includes('Apple M') || stdout.includes('Apple Silicon')) {
      const vramMatch = stdout.match(/VRAM.*?(\d+)\s*GB/i);
      const vram = vramMatch ? parseInt(vramMatch[1]) : 0;
      return { type: 'apple-silicon', vram };
    }

    // Intel Mac 独立显卡
    if (stdout.includes('NVIDIA')) {
      return { type: 'nvidia', vram: parseVRAM(stdout) };
    }
    if (stdout.includes('AMD')) {
      return { type: 'amd', vram: parseVRAM(stdout) };
    }

    return { type: 'none', vram: 0 };
  } catch (error) {
    return { type: 'none', vram: 0 };
  }
}

/**
 * Linux GPU 检测
 * @returns {Promise<{type: string, vram: number}>}
 */
async function detectLinuxGPU() {
  // 1. 尝试 nvidia-smi
  try {
    const { stdout } = await execAsync('nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits');
    const vram = Math.round(parseInt(stdout.trim()) / 1024); // MB -> GB
    return { type: 'nvidia', vram };
  } catch {}

  // 2. 尝试 rocm-smi (AMD)
  try {
    const { stdout } = await execAsync('rocm-smi --showmeminfo vram');
    const vramMatch = stdout.match(/(\d+)\s*MB/);
    const vram = vramMatch ? Math.round(parseInt(vramMatch[1]) / 1024) : 0;
    return { type: 'amd', vram };
  } catch {}

  // 3. 检查 NVIDIA 驱动
  try {
    await access('/proc/driver/nvidia/version');
    return { type: 'nvidia', vram: 0 };
  } catch {}

  return { type: 'none', vram: 0 };
}

/**
 * Windows GPU 检测
 * @returns {Promise<{type: string, vram: number}>}
 */
async function detectWindowsGPU() {
  try {
    const { stdout } = await execAsync('wmic path win32_VideoController get Name,AdapterRAM');

    if (stdout.includes('NVIDIA')) {
      const vram = parseWindowsVRAM(stdout);
      return { type: 'nvidia', vram };
    }
    if (stdout.includes('AMD') || stdout.includes('Radeon')) {
      const vram = parseWindowsVRAM(stdout);
      return { type: 'amd', vram };
    }

    return { type: 'none', vram: 0 };
  } catch (error) {
    return { type: 'none', vram: 0 };
  }
}

/**
 * 解析 macOS VRAM
 * @param {string} output
 * @returns {number}
 */
function parseVRAM(output) {
  const match = output.match(/VRAM.*?(\d+)\s*(?:GB|MB)/i);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[0].toUpperCase();
    return unit.includes('GB') ? value : Math.round(value / 1024);
  }
  return 0;
}

/**
 * 解析 Windows VRAM
 * @param {string} output
 * @returns {number}
 */
function parseWindowsVRAM(output) {
  const match = output.match(/(\d+)/);
  if (match) {
    const bytes = parseInt(match[1]);
    return Math.round(bytes / (1024 ** 3)); // bytes -> GB
  }
  return 0;
}
