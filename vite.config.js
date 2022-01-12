import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/face/',
  server: {
    host: '192.168.3.25',
    port: 8888
  }
})
