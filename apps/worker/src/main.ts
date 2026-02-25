import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { WorkerModule } from './worker.module';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(WorkerModule, {
		bufferLogs: true,
	});
	const logger = app.get(Logger);
	app.useLogger(logger);
	logger.log('Worker is running...');
}
void bootstrap();
