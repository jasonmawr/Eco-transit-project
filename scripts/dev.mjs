import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================');
console.log(' EcoTransit: Spawning API and WEB Dev Servers in Parallel');
console.log('========================================================');

function runProcess(name, command, args, cwd) {
  const p = spawn(command, args, {
    cwd,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  p.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        console.log(`[${name}] ${trimmed}`);
      }
    });
  });

  p.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        console.error(`[${name}] ${trimmed}`);
      }
    });
  });

  p.on('close', (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
    // Terminate the entire runner if one of the critical processes exit
    process.exit(code || 0);
  });

  return p;
}

const apiProcess = runProcess('API', 'npm', ['run', 'dev', '--workspace=@ecotransit/api'], rootDir);
const webProcess = runProcess('WEB', 'npm', ['run', 'dev', '--workspace=@ecotransit/web'], rootDir);

// Handle clean exits on terminate signals
const cleanExit = () => {
  console.log('\nShutting down dev processes...');
  try {
    apiProcess.kill();
  } catch (e) {}
  try {
    webProcess.kill();
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', cleanExit);
