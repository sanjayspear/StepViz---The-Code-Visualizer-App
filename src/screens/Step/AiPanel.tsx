// "Explain with AI (beta)" inside the explanation card (Phase 2, stage i).
import { useSyncExternalStore } from 'react';
import { aiClient, aiEligible } from '../../ai/aiClient';
import { AI_MODEL_TOTAL_MB } from '../../ai/config';
import type { Trace } from '../../trace/types';

export const AI_UNAVAILABLE = "AI explanation isn't available right now.";

export function useAi() {
  useSyncExternalStore(aiClient.subscribe, aiClient.getVersion);
  return aiClient;
}

export function AiPanel({ trace, index }: { trace: Trace; index: number }) {
  const ai = useAi();
  if (!trace.steps.some(aiEligible)) return null; // built-in examples have hand-written text
  const status = ai.status;
  const step = trace.steps[index];
  const explanation = ai.explanationFor(trace, index);

  switch (status.kind) {
    case 'off':
    case 'checking':
      return (
        <div className="ai-panel">
          <button type="button" className="ai-btn" onClick={() => void ai.start()} disabled={status.kind === 'checking'}>
            Explain with AI (beta)
          </button>
        </div>
      );
    case 'unsupported':
      return (
        <div className="ai-panel">
          <p className="ai-panel__message" role="status">
            AI explanations need a browser with WebGPU, such as Chrome on a computer.
          </p>
        </div>
      );
    case 'note':
      return (
        <div className="ai-panel ai-panel--note" role="group" aria-label="Before using AI explanations">
          <p className="ai-panel__note">
            This downloads a free AI model (about 1 GB) to your device the first time, so use Wi-Fi. Your code stays on
            your device.
          </p>
          <p className="ai-panel__credit">Model: Qwen2.5-1.5B-Instruct (Apache 2.0), run in your browser with WebLLM.</p>
          <div className="ai-panel__actions">
            <button type="button" className="ai-btn ai-btn--primary" onClick={() => ai.acceptNote()}>
              Continue
            </button>
            <button type="button" className="ai-btn" onClick={() => ai.cancel()}>
              Cancel
            </button>
          </div>
        </div>
      );
    case 'downloading':
      return (
        <div className="ai-panel">
          <p className="ai-panel__message" id="ai-progress-label">
            Downloading the AI model: {status.mb} MB of {AI_MODEL_TOTAL_MB} MB
          </p>
          <div className="ai-progress-row">
            <div
              className="ai-progress"
              role="progressbar"
              aria-labelledby="ai-progress-label"
              aria-valuemin={0}
              aria-valuemax={AI_MODEL_TOTAL_MB}
              aria-valuenow={status.mb}
            >
              <div className="ai-progress__fill" style={{ width: `${(status.mb / AI_MODEL_TOTAL_MB) * 100}%` }} />
            </div>
            <button type="button" className="ai-btn" onClick={() => ai.cancel()}>
              Cancel
            </button>
          </div>
        </div>
      );
    case 'preparing':
      return (
        <div className="ai-panel">
          <div className="ai-progress-row">
            <p className="ai-panel__message" role="status">
              Getting the AI model ready…
            </p>
            <button type="button" className="ai-btn" onClick={() => ai.cancel()}>
              Cancel
            </button>
          </div>
        </div>
      );
    case 'failed':
      return (
        <div className="ai-panel">
          <p className="ai-panel__message" role="status">
            {AI_UNAVAILABLE}
          </p>
        </div>
      );
    case 'ready':
      if (!aiEligible(step)) return null;
      if (!explanation || explanation.state === 'pending') {
        return (
          <div className="ai-panel">
            <p className="ai-panel__message" role="status">
              Writing an AI explanation…
            </p>
          </div>
        );
      }
      if (explanation.state === 'failed') {
        return (
          <div className="ai-panel">
            <p className="ai-panel__message" role="status">
              {AI_UNAVAILABLE}
            </p>
          </div>
        );
      }
      return null; // done: the card shows the AI text; rejected: the normal text stays
  }
}
