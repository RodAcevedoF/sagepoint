import { Injectable, OnApplicationShutdown, Inject, Logger } from '@nestjs/common';
import neo4j, { Driver, Session, Config, Result } from 'neo4j-driver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  private readonly driver: Driver;
  private readonly logger = new Logger(Neo4jService.name);

  constructor(private readonly configService: ConfigService) {
    const uri = this.configService.get<string>('NEO4J_URI') || 'bolt://localhost:7687';
    const user = this.configService.get<string>('NEO4J_USER') || 'neo4j';
    const password = this.configService.get<string>('NEO4J_PASSWORD') || 'password';

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    
    // Verify connection
    this.driver.verifyConnectivity()
      .then(() => this.logger.log(`Connected to Neo4j at ${uri}`))
      .catch(err => this.logger.error(`Failed to connect to Neo4j: ${err.message}`));
  }

  getDriver(): Driver {
    return this.driver;
  }

  async onApplicationShutdown() {
    await this.driver.close();
  }

  // Helper for simple queries
  async read(cypher: string, params: Record<string, any> = {}): Promise<Result> {
    const session = this.driver.session({ defaultAccessMode: neo4j.session.READ });
    try {
      return await session.run(cypher, params);
    } finally {
      await session.close();
    }
  }

  async write(cypher: string, params: Record<string, any> = {}): Promise<Result> {
    const session = this.driver.session({ defaultAccessMode: neo4j.session.WRITE });
    try {
      return await session.run(cypher, params);
    } finally {
      await session.close();
    }
  }
}
