import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaService } from '@/core/infra/database/prisma.service';
import { getDependencies } from '@/core/bootstrap';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { Neo4jHealthIndicator } from './indicators/neo4j.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    PrismaService,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    Neo4jHealthIndicator,
    {
      provide: 'NEO4J_SERVICE',
      useFactory: () => getDependencies().neo4jService,
    },
  ],
})
export class HealthModule {}
