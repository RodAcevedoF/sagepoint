import { Injectable, OnApplicationShutdown, Inject, Logger, Optional } from '@nestjs/common';
import neo4j, { Driver, Session, Config, Result } from 'neo4j-driver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  private readonly driver: Driver;
  private readonly logger = new Logger(Neo4jService.name);

  constructor(
    @Inject(ConfigService)
    @Optional()
    private readonly configServiceOrOptions?: ConfigService | { uri: string; user: string; pass: string; encrypted: string },
    // Legacy support arguments if any (none here)
  ) {
    // TODO: Remove this legacy support
    let uri, user, password, encrypted;

    if (configServiceOrOptions instanceof ConfigService) {
        uri = configServiceOrOptions.get<string>('NEO4J_URI') || 'bolt://localhost:7687';
        user = configServiceOrOptions.get<string>('NEO4J_USER') || 'neo4j';
        password = configServiceOrOptions.get<string>('NEO4J_PASSWORD') || 'password';
        encrypted = configServiceOrOptions.get<string>('NEO4J_ENCRYPTION') || 'ENCRYPTION_OFF'; // Default for dev
    } else if (configServiceOrOptions) {
        uri = configServiceOrOptions.uri;
        user = configServiceOrOptions.user;
        password = configServiceOrOptions.pass;
        encrypted = configServiceOrOptions.encrypted;
    } else {
        // Fallback defaults
        uri = 'bolt://localhost:7687';
        user = 'neo4j';
        password = 'password';
        encrypted = 'ENCRYPTION_OFF';
    }

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      disableLosslessIntegers: true,
      encrypted: encrypted === 'ENCRYPTION_ON' ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
    });
    
    // Verify connection
    this.driver.getServerInfo()
      .then((serverInfo) => this.logger.log(`Connected to Neo4j at ${uri} (Version: ${serverInfo.agent})`))
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
