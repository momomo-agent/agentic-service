import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export function optimize(hardware) {
  const { gpu, memory, cpu } = hardware;
  if (gpu.type === 'apple-silicon') {
    return { threads: 8, memoryLimit: Math.floor(memory * 0.75), model: 'gemma4:26b', quantization: 'q8' };
  }
  if (gpu.type === 'nvidia') {
    const vram = gpu.vram ?? memory * 0.5;
    return { threads: 4, memoryLimit: Math.floor(vram * 0.8), model: 'gemma4:13b', quantization: 'q4' };
  }
  return { threads: cpu.cores ?? 2, memoryLimit: Math.floor(memory * 0.5), model: 'gemma2:2b', quantization: 'q4' };
}

export async function setupOllama(profile) {
  const modelName = profile?.llm?.model;

  // Check if ollama is installed
  let installed = false;
  let version;
  try {
    const { stdout } = await execAsync('ollama --version');
    installed = true;
    const match = stdout.match(/(\d+\.\d+\.\d+)/);
    version = match ? match[1] : stdout.trim();
  } catch {
    return { installed: false, modelReady: false, modelName };
  }

  // Check if model is already pulled
  let modelReady = false;
  try {
    const { stdout } = await execAsync('ollama list');
    if (modelName && stdout.includes(modelName)) {
      return { installed, version, modelReady: true, modelName };
    }
  } catch {
    // treat as model absent, attempt pull
  }

  // Pull the model
  if (!modelName) return { installed, version, modelReady: false, modelName };

  try {
    await new Promise((resolve, reject) => {
      const child = spawn('ollama', ['pull', modelName]);
      child.stdout?.on('data', () => {});
      child.stderr?.on('data', () => {});
      child.on('close', code => code === 0 ? resolve() : reject(new Error(`pull exited ${code}`)));
      child.on('error', reject);
    });
    modelReady = true;
  } catch {
    modelReady = false;
  }

  return { installed, version, modelReady, modelName };
}
