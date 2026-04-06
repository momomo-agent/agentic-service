import { exec, spawn } from 'node:child_process';
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
      promptInstallation(process.platform);
      return { installed: false, version: null, modelReady: false, modelName: profile.llm.model };
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

    proc.stdout.on('data', (data) => {
      const match = data.toString().match(/(\d+)%.*?([\d.]+\s*[KMG]B\/s)/);
      if (match) {
        const percent = parseInt(match[1]);
        if (percent !== lastPercent) {
          lastPercent = percent;
          onProgress(percent, match[2]);
        }
      }
    });

    proc.stderr.on('data', (data) => console.error('Ollama stderr:', data.toString()));
    proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ollama pull exited with code ${code}`)));
    proc.on('error', reject);
  });
}

function promptInstallation(platform) {
  console.log(chalk.yellow('\n⚠️  Ollama is not installed\n'));
  const instructions = {
    darwin: ['Install with Homebrew:', '  brew install ollama'],
    linux: ['Install with:', '  curl -fsSL https://ollama.ai/install.sh | sh'],
    win32: ['Download installer from:', '  https://ollama.ai/download/windows']
  };
  const [label, cmd] = instructions[platform] || ['Visit:', '  https://ollama.ai/download'];
  console.log(chalk.cyan(label));
  console.log(chalk.white(cmd + '\n'));
  console.log(chalk.gray('After installation, run this command again.\n'));
}
