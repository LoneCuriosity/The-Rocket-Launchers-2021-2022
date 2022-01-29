import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        hmr: process.env.GITPOD_WORKSPACE_URL
          ? {
              host: process.env.GITPOD_WORKSPACE_URL.replace('https://', '3000-'),
              protocol: 'wss',
              clientPort: 443
            }
          : true
      }
})