/**
 * Jest runs the pure, RN-free code: the game/stats logic in src/core and the
 * quiz question bank (validation). These modules never import React Native or
 * Expo, so they run under Node with ts-jest, with no emulator or native build.
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/core', '<rootDir>/src/games/quiz/questions'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
};
