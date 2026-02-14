import { execSync } from 'child_process';

const ports = [3000, 3001];

for (const port of ports) {
  try {
    const output = execSync('netstat -ano', { encoding: 'utf8' });
    const pids = [
      ...new Set(
        output
          .split('\n')
          .filter((l) => l.includes(`:${port}`) && l.includes('LISTENING'))
          .map((l) => l.trim().split(/\s+/).pop())
          .filter(Boolean),
      ),
    ];

    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`Killed zombie (PID ${pid}) on port ${port}`);
      } catch {
        // already exited
      }
    }
  } catch {
    // skip
  }
}
