import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'blood-pressure-diary',
  brand: {
    displayName: '혈압다이어리',
    primaryColor: '#27AE60',
    icon: '',
    bridgeColorMode: 'basic',
  },
  web: {
    host: '172.30.1.50',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});