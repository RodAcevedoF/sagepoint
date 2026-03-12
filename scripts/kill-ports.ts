import { execSync } from 'child_process';

const ports = [3000, 3001];

for (const port of ports) {
  try {
    const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    for (const pid of pids) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        console.log(`Killed zombie (PID ${pid}) on port ${port}`);
      } catch {
        // already exited
      }
    }
  } catch {
    // no process on this port
  }
}
