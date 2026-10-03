import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { verifyObturaEnvironment } from './build/verify-environment'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  verifyObturaEnvironment(env, command === 'build')
  return {
    base: env.VITE_BASE_PATH || '/',
    // Publish only the curated photo portfolio, never the inherited GRS public assets.
    publicDir: 'public/obtura-images',
    plugins: [react()],
    build: { target: 'es2022', sourcemap: false },
  }
})
