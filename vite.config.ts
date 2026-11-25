import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Content Security Policy, added to index.html in production builds only
// (Vite's dev server injects inline scripts that a strict policy would block).
// Pasted code runs only inside the Web Worker; the worker additionally removes
// fetch/XHR/WebSocket/importScripts after Pyodide has loaded (see src/runner).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "worker-src 'self'",
  // Optional AI explanations: Ollama on the student's own computer, nothing else.
  "connect-src 'self' http://localhost:11434",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function cspPlugin(): Plugin {
  return {
    name: 'stepviz-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      );
    },
  };
}

export default defineConfig({
  // Relative base so the static build works at any GitHub Pages path.
  base: './',
  plugins: [react(), cspPlugin()],
  worker: { format: 'es' },
});
