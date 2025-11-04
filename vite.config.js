import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'vite-plugin-vue-mcp'
import path from 'path'

export default defineConfig({
  plugins: [
    VueMcp(),
    vue()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
