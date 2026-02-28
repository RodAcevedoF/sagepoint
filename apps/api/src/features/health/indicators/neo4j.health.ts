import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import type { Neo4jService } from '@sagepoint/graph';

@Injectable()
export class Neo4jHealthIndicator extends HealthIndicator {
  constructor(
    @Inject('NEO4J_SERVICE') private readonly neo4jService: Neo4jService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.neo4jService.getDriver().getServerInfo();
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Neo4j check failed',
        this.getStatus(key, false, { message: (error as Error).message }),
      );
    }
  }
}
