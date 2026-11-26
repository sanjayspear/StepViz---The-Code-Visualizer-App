import { defineConfig, devices } from '@playwright/test';

// A dedicated port, and never reuse a server already running there (it could be
// another project).
const PORT = 4317;

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}/`,
  },
  projects: [
    // Runs the Python tracer under Node with Pyodide (no browser needed).
    { name: 'tracer', testMatch: /(tracer|jstracer|explainer|java|cpp|c|switch|practice-questions|practice-python|practice-js)\.spec\.ts/ },
    // The section 9 acceptance checklist, against the production build.
    { name: 'e2e', testMatch: /(acceptance|screen3|javascript|java-worker|java-app|cpp-app|c-app|practice-app)\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
