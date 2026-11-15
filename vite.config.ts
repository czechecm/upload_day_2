import { fileURLToPath, URL } from 'node:url'

import { defineConfig, ProxyOptions } from 'vite'
import TestHelpers from '@elo/elo-cli'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

TestHelpers.init()

const config = {
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '',
  server: {
    port: 5173,
    proxy: {} as Record<string, string | ProxyOptions>,
  },
}

config.server.proxy[TestHelpers.getIxContext()] = {
  target: TestHelpers.getIxServer(),
  changeOrigin: true,
}

// https://vite.dev/config/
export default defineConfig(config)
