/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Keep CRA's output folder so the Amplify build (amplify.yml) is unchanged.
  build: { outDir: 'build' },
  server: { port: 3000, open: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
      // Fail the run if coverage drops, so untested code can't slip in.
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
});
