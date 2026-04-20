// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // ✅ Only absolute base in production
  base: process.env.NODE_ENV === 'production' ? 'https://user.flexicrm.in' : '/',
})