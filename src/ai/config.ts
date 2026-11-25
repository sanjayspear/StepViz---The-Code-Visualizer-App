// AI explanations (Phase 2, stage i): a free, open model that runs in the
// student's browser with WebLLM. Nothing is sent to a server.

/** Qwen2.5-1.5B-Instruct (Apache-2.0), 4-bit, from Hugging Face (mlc-ai). */
export const AI_MODEL_ID = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
/** Size of the model files on Hugging Face, for the progress bar. */
export const AI_MODEL_TOTAL_MB = 880;
/**
 * The compiled model program, served from our own site (a copy of MLC's
 * binary-mlc-llm-libs file web-llm-models/v0_2_87/base/Qwen2-1.5B-Instruct-q4f16_1_cs1k-webgpu.wasm,
 * sha256 155ef7359c859f7d646f4c5adc548d779475da3e3196701c7a9d4b82827559a8),
 * so the only outside hosts are Hugging Face's.
 */
export const AI_MODEL_LIB_PATH = 'ai/Qwen2-1.5B-Instruct-q4f16_1_cs1k-webgpu.wasm';
/** One explanation may take at most this long. */
export const AI_TIMEOUT_MS = 30_000;
/** Explain the current step and prepare this many after it. */
export const AI_PREFETCH = 2;
