import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'bpdiary',
  brand: {
    displayName: '혈압다이어리',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/appsintoss/22843/3af0b82a-7a3c-47b3-8a29-be14a0c5ef1b.png',
  },
   web: {
    host: '172.30.1.50',
    port: 5173,
    commands: {
      dev: 'vite --host --port 5173',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
