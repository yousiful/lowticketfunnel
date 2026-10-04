import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Page version for the funnel tracker: Netlify's commit sha + build date, so the
// drop-off dashboard can compare how each version of the page performs.
const version = `${new Date().toISOString().slice(0, 10)}-${(process.env.COMMIT_REF || 'local').slice(0, 7)}`

export default defineConfig({
  plugins: [react()],
  define: { __PAGE_VERSION__: JSON.stringify(version) },
})
