import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  build: {
    // extensions run in a webworker context, so build a browser bundle
    // (this also picks up the `browser` field of imported node modules)
    lib: {
      entry: 'src/extension.ts',
      formats: ['cjs'],
      fileName: () => 'extension.js',
    },
    outDir: 'dist/web',
    target: 'es2022',
    minify: mode === 'production',
    sourcemap: true,
    rolldownOptions: {
      external: ['vscode'], // provided by the extension host
      transform: {
        // provide a shim for the global `process` variable
        inject: { process: 'process/browser' },
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
}));
