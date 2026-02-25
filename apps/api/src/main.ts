import 'dotenv/config';
import { execSync } from 'child_process';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { bootstrap as initDependencies } from '@/core/bootstrap';
import { AppModule } from './app.module';

import cookieParser from 'cookie-parser';

function killPort(port: number) {
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
      } catch {
        // already exited
      }
    }
  } catch {
    // netstat unavailable — skip
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  initDependencies();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 3333);

  try {
    await app.listen(port);
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && err.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} in use — killing zombie and retrying...`);
      killPort(port);
      await sleep(1000);
      await app.listen(port);
    } else {
      throw err;
    }
  }
}

void main();
