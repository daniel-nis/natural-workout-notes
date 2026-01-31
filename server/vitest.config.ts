import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Default: run unit tests only (fast)
    include: ['src/tests/**/*.unit.test.ts'],
    testTimeout: 5000,
  },
})