import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'bpdiary',
  brand: {
    displayName: '혈압다이어리',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/icons/png/4x/icon-healthcare-color.png',
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
