import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	rootDir: '.',
	roots: ['<rootDir>/tests'],
	testRegex: '.*\\.spec\\.ts$',
	transform: {
		'^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
	},
	collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts'],
	coverageDirectory: '../../coverage/domain',
};

export default config;
