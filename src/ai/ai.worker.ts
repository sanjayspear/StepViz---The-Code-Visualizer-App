/// <reference lib="webworker" />
// The AI worker: runs the open model with WebLLM. Separate from the code-runner
// workers; it only receives chat text built from the trace and never runs user
// code. It is started from a blob: URL so the page's Content-Security-Policy
// applies to it: it may fetch only from our own site and Hugging Face.
import {
  CreateMLCEngine,
  deleteModelAllInfoInCache,
  hasModelInCache,
  prebuiltAppConfig,
  type AppConfig,
  type MLCEngine,
} from '@mlc-ai/web-llm';
import { AI_MODEL_ID } from './config';
import type { FromAiWorker, ToAiWorker } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

let engine: MLCEngine | null = null;
const post = (msg: FromAiWorker) => self.postMessage(msg);

/** WebLLM's own record for the model, with the model program from our site. */
function appConfig(libUrl: string): AppConfig {
  const record = prebuiltAppConfig.model_list.find((m) => m.model_id === AI_MODEL_ID);
  if (!record) throw new Error(`Unknown model ${AI_MODEL_ID}`);
  return { model_list: [{ ...record, model_lib: libUrl }], cacheBackend: 'cache' };
}

self.onmessage = async (event: MessageEvent<ToAiWorker>) => {
  const msg = event.data;
  try {
    if (msg.type === 'load') {
      engine = await CreateMLCEngine(AI_MODEL_ID, {
        appConfig: appConfig(msg.libUrl),
        initProgressCallback: (r) => post({ type: 'progress', progress: r.progress, text: r.text }),
      });
      post({ type: 'ready' });
    } else if (msg.type === 'explain') {
      if (!engine) throw new Error('The AI model is not loaded.');
      const reply = await engine.chat.completions.create({
        messages: msg.messages,
        temperature: 0.2,
        max_tokens: 160,
        response_format: { type: 'json_object' },
      });
      post({ type: 'explained', id: msg.id, text: reply.choices[0]?.message?.content ?? '' });
    } else if (msg.type === 'interrupt') {
      await engine?.interruptGenerate();
    } else if (msg.type === 'remove') {
      const config = appConfig(msg.libUrl);
      const had = await hasModelInCache(AI_MODEL_ID, config);
      await engine?.unload();
      engine = null;
      await deleteModelAllInfoInCache(AI_MODEL_ID, config);
      post({ type: 'removed', had });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (msg.type === 'load') post({ type: 'load-error', message });
    else if (msg.type === 'explain') post({ type: 'explain-error', id: msg.id, message });
    else if (msg.type === 'remove') post({ type: 'removed', had: false });
  }
};
