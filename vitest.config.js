import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '/src/lib/username': path.resolve(__dirname, 'src/test/stubs/username.js'),
      'lucide-react': path.resolve(__dirname, 'src/test/stubs/lucide-react.js'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.jsx',
    globals: true,
    exclude: ['e2e/**', 'node_modules/**', '.worktrees/**'],
  },
});
