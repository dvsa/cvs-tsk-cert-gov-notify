module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src', '<rootDir>/tests'],
	setupFiles: ['jest-plugin-context/setup'],
	moduleFileExtensions: ['js', 'ts', 'd.ts'],
	testResultsProcessor: 'jest-sonar-reporter',
	testMatch: ['**/*.*Test.ts'],
	collectCoverageFrom: ['!tests/**'],
};
