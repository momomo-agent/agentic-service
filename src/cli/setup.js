import ora from 'ora';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { detect } from '../detector/hardware.js';
import { getProfile } from '../detector/profiles.js';
import { setupOllama } from '../detector/optimizer.js';

async function installOllama(cmd) {
  await new Promise((resolve, reject) => {
    const child = spawn('sh', ['-c', cmd], { stdio: 'inherit' });
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`install failed: ${code}`)));
  });
}

async function pullModel(model) {
  const spinner = ora(`Pulling model ${model}...`).start();
  await new Promise((resolve, reject) => {
    const child = spawn('ollama', ['pull', model], { stdio: 'inherit' });
    child.on('close', code => {
      code === 0 ? spinner.succeed(`Model ${model} ready`) : reject(new Error(`pull failed: ${code}`));
      if (code === 0) resolve();
    });
  });
}

const CONFIG_PATH = path.join(os.homedir(), '.agentic-service', 'config.json');

export async function runSetup() {
  console.log(chalk.bold('Setup Wizard\n'));

  const hardwareSpinner = ora('Detecting hardware...').start();
  const hardware = await detect();
  hardwareSpinner.succeed('Hardware detected');
  console.log(chalk.gray(`  Platform: ${hardware.platform}`));
  console.log(chalk.gray(`  Arch: ${hardware.arch}`));
  console.log(chalk.gray(`  GPU: ${hardware.gpu.type} (${hardware.gpu.vram}GB)`));
  console.log(chalk.gray(`  Memory: ${hardware.memory}GB`));
  console.log(chalk.gray(`  CPU: ${hardware.cpu.model} (${hardware.cpu.cores} cores)\n`));

  const profileSpinner = ora('Fetching recommended configuration...').start();
  const profile = await getProfile(hardware);
  profileSpinner.succeed('Configuration loaded');
  console.log(chalk.gray(`  LLM: ${profile.llm.provider} / ${profile.llm.model}`));
  console.log(chalk.gray(`  STT: ${profile.stt.provider} / ${profile.stt.model}`));
  console.log(chalk.gray(`  TTS: ${profile.tts.provider} / ${profile.tts.voice}`));
  if (profile.fallback) {
    console.log(chalk.gray(`  Fallback: ${profile.fallback.provider} / ${profile.fallback.model}\n`));
  }

  if (profile.llm.provider === 'ollama') {
    console.log(chalk.bold('Setting up Ollama...\n'));
    const ollamaStatus = await setupOllama(profile);

    if (ollamaStatus.needsInstall) {
      const installSpinner = ora('Installing Ollama...').start();
      await installOllama(ollamaStatus.installCommand);
      installSpinner.succeed('Ollama installed');
      await pullModel(profile.llm.model);
    }

    if (ollamaStatus.ready) {
      console.log(chalk.green(`✓ Ollama ready with model ${ollamaStatus.model}\n`));
    } else {
      console.log(chalk.yellow(`⚠ Model ${ollamaStatus.model} may not be fully ready\n`));
    }
  }

  const configSpinner = ora('Saving configuration...').start();
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify({ hardware, profile }, null, 2));
  configSpinner.succeed('Configuration saved');

  console.log(chalk.green('\n✓ Setup complete!\n'));
}
