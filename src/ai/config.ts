// AI explanations: Llama, run by Ollama on the student's own desktop or laptop.
// StepViz talks only to Ollama on this computer (localhost); nothing is sent
// anywhere else, and the AI only ever sees facts from the exact trace.

/** Ollama's local address (its default port). */
export const OLLAMA_URL = 'http://localhost:11434';
/** Llama 3.2 3B (Llama 3.2 Community License), about 2 GB, downloaded with Ollama. */
export const AI_MODEL = 'llama3.2:3b';
/** How long the check for Ollama may take. */
export const AI_CHECK_TIMEOUT_MS = 4_000;
/** One explanation may take at most this long (slower computers take longer). */
export const AI_TIMEOUT_MS = 60_000;
/** Explain the current step and prepare this many after it. */
export const AI_PREFETCH = 2;
