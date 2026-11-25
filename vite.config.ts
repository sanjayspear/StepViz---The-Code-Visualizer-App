import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Content Security Policy, added to index.html in production builds only
// (Vite's dev server injects inline scripts that a strict policy would block).
// Pasted code runs only inside the code-runner workers, which also remove
// fetch/XHR/WebSocket/importScripts before any code runs (see src/runner).
// connect-src: our own site, plus Hugging Face hosts for the optional AI model
// download (huggingface.co redirects to its CDN on *.hf.co). Nothing else.
// worker-src blob: lets the AI worker start from a blob: URL, which makes this
// policy apply inside that worker too.
export const CONNECT_SRC = "'self' https://huggingface.co https://*.hf.co";
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "worker-src 'self' blob:",
  `connect-src ${CONNECT_SRC}`,
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
