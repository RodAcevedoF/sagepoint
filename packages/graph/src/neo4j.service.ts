import { Injectable, OnApplicationShutdown, Inject, Logger, Optional } from '@nestjs/common';
import neo4j, { type Driver, type Result } from 'neo4j-driver';
import { ConfigService } from '@nestjs/config';

interface Neo4jDirectConfig {
	uri: string;
	user: string;
	pass: string;
	encrypted: string;
}

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
	private readonly driver: Driver;
	private readonly logger = new Logger(Neo4jService.name);

	constructor(
		@Inject(ConfigService)
		@Optional()
		private readonly configServiceOrOptions?: ConfigService | Neo4jDirectConfig,
	) {
		let uri: string;
		let user: string;
		let password: string;
		let encrypted: string;

		if (configServiceOrOptions instanceof ConfigService) {
			uri = configServiceOrOptions.get<string>('NEO4J_URI') || 'bolt://localhost:7687';
			user = configServiceOrOptions.get<string>('NEO4J_USER') || 'neo4j';
			password = configServiceOrOptions.get<string>('NEO4J_PASSWORD') || 'password';
			encrypted = configServiceOrOptions.get<string>('NEO4J_ENCRYPTION') || 'ENCRYPTION_OFF';
		} else if (configServiceOrOptions) {
			uri = configServiceOrOptions.uri;
			user = configServiceOrOptions.user;
			password = configServiceOrOptions.pass;
			encrypted = configServiceOrOptions.encrypted;
		} else {
			uri = 'bolt://localhost:7687';
			user = 'neo4j';
			password = 'password';
			encrypted = 'ENCRYPTION_OFF';
		}

		this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
			disableLosslessIntegers: true,
			encrypted: encrypted === 'ENCRYPTION_ON',
		});

		this.driver
			.getServerInfo()
			.then((serverInfo) =>
				this.logger.log(`Connected to Neo4j at ${uri} (Version: ${serverInfo.agent})`),
			)
			.catch((err: Error) =>
				this.logger.error(`Failed to connect to Neo4j: ${err.message}`),
			);
	}

	getDriver(): Driver {
		return this.driver;
	}

	async onApplicationShutdown() {
		await this.driver.close();
	}

	async read(cypher: string, params: Record<string, unknown> = {}): Promise<Result> {
		const session = this.driver.session({ defaultAccessMode: neo4j.session.READ });
		try {
			return await session.run(cypher, params);
		} finally {
			await session.close();
		}
	}

	async write(cypher: string, params: Record<string, unknown> = {}): Promise<Result> {
		const session = this.driver.session({ defaultAccessMode: neo4j.session.WRITE });
		try {
			return await session.run(cypher, params);
		} finally {
			await session.close();
		}
	}
}
