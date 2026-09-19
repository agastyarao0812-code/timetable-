import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages serves this project from /timetable-/. `vite build` and `vite preview`
  // both run in production mode, so they get the repo base path; `vite dev` stays at
  // the root so `npm run dev` keeps working at http://localhost:5173.
  base: mode === 'production' ? '/timetable-/' : '/',
  plugins: [react()],
}))
