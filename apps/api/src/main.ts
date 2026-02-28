import 'dotenv/config';
import { execSync } from 'child_process';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { bootstrap as initDependencies } from '@/core/bootstrap';
import { AppModule } from './app.module';

import type { Request, Response, NextFunction } from 'express';
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

  // bull-board setup
  const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    queues: [
      new BullMQAdapter(
        new Queue('document-processing', { connection: redisConnection }),
      ),
      new BullMQAdapter(
        new Queue('roadmap-generation', { connection: redisConnection }),
      ),
    ],
    serverAdapter,
  });

  const bullUser = process.env.BULL_BOARD_USER || 'admin';
  const bullPass = process.env.BULL_BOARD_PASS || 'admin';
  app.use(
    '/admin/queues',
    (req: Request, res: Response, next: NextFunction) => {
      const auth = req.headers.authorization;
      if (auth) {
        const [, encoded] = auth.split(' ');
        const decoded = Buffer.from(encoded || '', 'base64').toString();
        const [user, pass] = decoded.split(':');
        if (user === bullUser && pass === bullPass) {
          return next();
        }
      }
      res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
      res.status(401).send('Authentication required');
    },
    serverAdapter.getRouter(),
  );

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
