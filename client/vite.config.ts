import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Honor a tooling-assigned PORT (e.g. preview runners) but default to 3000.
    port: Number(process.env.PORT) || 3000,
    open: false,
  },
});
