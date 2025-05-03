import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  base: '/',
  define: {
    'process.env.JWT_SECRET': JSON.stringify(process.env.JWT_SECRET || 'your-secret-key'),
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-helmet-async',
      'react-i18next',
      'i18next',
      'i18next-browser-languagedetector',
      'i18next-http-backend',
      'buffer',
      'process',
      'js-cookie',
      'uuid',
      'marked',
      'dompurify',
      'date-fns',
      'recharts',
      'jsonwebtoken',
      'otplib',
      'qrcode',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'idb'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs'
          ]
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true
  }
});