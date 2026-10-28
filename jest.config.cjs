module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'CommonJS', moduleResolution: 'node', esModuleInterop: true }, diagnostics: true }] },
  moduleNameMapper: { '^@/src/(.*)$': '<rootDir>/src/$1', '^@/(.*)$': '<rootDir>/src/$1' },
};
