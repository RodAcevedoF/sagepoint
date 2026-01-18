import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { bootstrap as initDependencies } from '@/core/bootstrap';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from '@/core/filters/domain-exception.filter';

import cookieParser from 'cookie-parser';

async function main() {
  initDependencies();

  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new DomainExceptionFilter());
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow Frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3333);
}

main();
