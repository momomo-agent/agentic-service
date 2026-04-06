import { exec, spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { promisify } from 'node:util';
import ora from 'ora';
import chalk from 'chalk';

const execAsync = promisify(exec);

export async function setupOllama(profile) {
  try {
    const spinner = ora('Checking Ollama installation...').start();
    const { installed, version } = await detectOllama();

    if (!installed) {
      spinner.fail('Ollama not installed');
      await executeInstall(process.platform);
      const result2 = await detectOllama();
      if (!result2.installed) return { installed: false, version: null, modelReady: false, modelName: profile.llm.model };
      spinner.succeed(`Ollama ${result2.version} installed`);
      const modelName2 = profile.llm.model;
      spinner.start(`Checking model: ${modelName2}...`);
      const modelExists2 = await checkModelExists(modelName2);
      if (modelExists2) { spinner.succeed(`Model ${modelName2} ready`); return { installed: true, version: result2.version, modelReady: true, modelName: modelName2 }; }
      spinner.info(`Model ${modelName2} not found, pulling...`);
      await pullModel(modelName2, (p, s) => { spinner.text = `Pulling ${modelName2}: ${p}% (${s})`; });
      spinner.succeed(`Model ${modelName2} pulled successfully`);
      return { installed: true, version: result2.version, modelReady: true, modelName: modelName2 };
    }

    spinner.succeed(`Ollama ${version} detected`);

    const modelName = profile.llm.model;
    spinner.start(`Checking model: ${modelName}...`);
    const modelExists = await checkModelExists(modelName);

    if (modelExists) {
      spinner.succeed(`Model ${modelName} ready`);
      return { installed: true, version, modelReady: true, modelName };
    }

    spinner.info(`Model ${modelName} not found, pulling...`);

    try {
      await pullModel(modelName, (percent, speed) => {
        spinner.text = `Pulling ${modelName}: ${percent}% (${speed})`;
      });
      spinner.succeed(`Model ${modelName} pulled successfully`);
      return { installed: true, version, modelReady: true, modelName };
    } catch (error) {
      spinner.fail(`Failed to pull model: ${error.message}`);
      return { installed: true, version, modelReady: false, modelName };
    }
  } catch (error) {
    console.error(chalk.red('Ollama setup failed:'), error.message);
    console.log(chalk.yellow('Falling back to cloud API\n'));
    return { installed: false, version: null, modelReady: false, modelName: profile.llm.model };
  }
}

async function detectOllama() {
  try {
    const { stdout } = await execAsync('ollama --version');
    const match = stdout.match(/ollama version is ([\d.]+)/i) || stdout.match(/([\d.]+)/);
    return { installed: true, version: match ? match[1] : 'unknown' };
  } catch {
    return { installed: false, version: null };
  }
}

async function checkModelExists(modelName) {
  try {
    const { stdout } = await execAsync('ollama list');
    return stdout.split('\n').some(line => line.startsWith(modelName));
  } catch {
    return false;
  }
}

async function pullModel(modelName, onProgress) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ollama', ['pull', modelName]);
    let lastPercent = 0;
    let buf = '';

    proc.stdout.on('data', (data) => {
      buf += data.toString();
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          const { completed = 0, total = 0 } = obj;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          if (percent !== lastPercent) {
            lastPercent = percent;
            const speed = obj.speed ? `${(obj.speed / 1e6).toFixed(1)}MB/s` : '';
            onProgress(percent, speed);
          }
        } catch { /* non-JSON line, ignore */ }
      }
    });

    proc.stderr.on('data', (data) => console.error('Ollama stderr:', data.toString()));
    proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ollama pull exited with code ${code}`)));
    proc.on('error', reject);
  });
}

function askConfirm(question) {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, ans => { rl.close(); resolve(ans.trim().toLowerCase()); });
  });
}

async function executeInstall(platform) {
  const instructions = {
    darwin: ['brew install ollama', () => spawn('brew', ['install', 'ollama'], { stdio: 'inherit' })],
    linux: ['curl -fsSL https://ollama.ai/install.sh | sh', () => spawn('sh', ['-c', 'curl -fsSL https://ollama.ai/install.sh | sh'], { stdio: 'inherit' })]
  };

  if (platform === 'win32') {
    console.log(chalk.yellow('\nDownload Ollama from: https://ollama.ai/download/windows'));
    process.exit(1);
  }

  const [cmd, runInstall] = instructions[platform] || instructions.linux;
  console.log(chalk.cyan(`\nInstall command: ${cmd}`));
  const ans = await askConfirm('Install Ollama now? [y/N] ');
  if (ans !== 'y') { console.log(chalk.yellow('Installation declined.')); process.exit(1); }

  await new Promise((resolve, reject) => {
    const proc = runInstall();
    proc.on('close', code => code === 0 ? resolve() : reject(new Error('Install failed')));
    proc.on('error', reject);
  });
}
