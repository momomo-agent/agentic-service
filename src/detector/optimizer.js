export function optimize(hardware) {
  const { gpu, memory, cpu } = hardware;
  if (gpu.type === 'apple-silicon') {
    return { threads: 8, memoryLimit: Math.floor(memory * 0.75), model: 'gemma4:26b' };
  }
  if (gpu.type === 'nvidia') {
    const vram = gpu.vram ?? memory * 0.5;
    return { threads: 4, memoryLimit: Math.floor(vram * 0.8), model: 'gemma4:13b' };
  }
  return { threads: cpu.cores ?? 2, memoryLimit: Math.floor(memory * 0.5), model: 'gemma2:2b' };
}
