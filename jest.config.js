/**
 * Jest is configured ONLY for the pure game/stats logic in src/core.
 * Those modules never import React Native or Expo, so they run under Node
 * with ts-jest and can be verified without an emulator or native build.
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/core'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
};
