// "Explain with AI (Llama on this computer)" inside the explanation card, on
// desktop and laptop screens only. Llama runs in Ollama on the student's own
// computer; without it, the built-in explanations stay as they are.
import { useState, useSyncExternalStore } from 'react';
import { aiClient } from '../../ai/aiClient';
import { AI_MODEL } from '../../ai/config';

export const AI_UNAVAILABLE = "AI explanation isn't available right now.";
export const AI_BUTTON = 'Explain with AI (Llama on this computer)';
export const AI_REQUIREMENT = 'AI explanations work on a desktop or laptop with Llama installed (free).';
export const AI_PHONE_NOTE = 'AI explanations are available on a desktop with Llama installed.';

export function useAi() {
  useSyncExternalStore(aiClient.subscribe, aiClient.getVersion);
  return aiClient;
}

function CopyLine({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(command).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };
  return (
    <div className="ai-command">
      <code>{command}</code>
      <button type="button" className="ai-btn ai-btn--small" onClick={copy} aria-label={`Copy: ${command}`}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

/** The 3 setup steps. */
function SetupPanel({ missing }: { missing: 'ollama' | 'model' }) {
  const origin = window.location.origin;
  return (
    <div className="ai-panel ai-panel--note" role="group" aria-label="Set up AI explanations">
      <p className="ai-panel__note">
        {missing === 'model'
          ? 'Ollama is running, but the Llama model is not downloaded yet. Do step 2, then press Try again.'
          : `${AI_REQUIREMENT} We could not reach Llama on this computer. Set it up once:`}
      </p>
      <ol className="ai-steps">
        <li>
          Install Ollama (free) from <strong>ollama.com</strong> and open it.
        </li>
        <li>
          Download Llama (about 2 GB, use Wi-Fi). In a terminal, run:
          <CopyLine command={`ollama pull ${AI_MODEL}`} />
        </li>
        <li>
          Let StepViz talk to it. On a Mac, run this, then quit Ollama and open it again:
          <CopyLine command={`launchctl setenv OLLAMA_ORIGINS "${origin}"`} />
          On Windows, run this in Command Prompt, then quit Ollama and open it again:
          <CopyLine command={`setx OLLAMA_ORIGINS "${origin}"`} />
        </li>
      </ol>
      <p className="ai-panel__credit">
        Works in Chrome, Edge and Firefox. If the browser asks to let this site use devices on your network, choose Allow.
        Your code never leaves this computer. Built with Llama (Llama 3.2 Community License, Meta).
      </p>
      <div className="ai-panel__actions">
        <button type="button" className="ai-btn ai-btn--primary" onClick={() => void aiClient.start()}>
          Try again
        </button>
        <button type="button" className="ai-btn" onClick={() => aiClient.close()}>
          Close
        </button>
      </div>
    </div>
  );
}

/** `eligible`: this step may get an AI explanation (live trace, not a crash step). */
export function AiPanel({ eligible, explanation }: { eligible: boolean; explanation: ReturnType<typeof aiClient.explanationFor> }) {
  const ai = useAi();
  const status = ai.status;
  switch (status.kind) {
    case 'off':
    case 'checking':
      return (
        <div className="ai-panel">
          <div className="ai-panel__actions">
            <button type="button" className="ai-btn" onClick={() => void ai.start()} disabled={status.kind === 'checking'}>
              {AI_BUTTON}
            </button>
            {status.kind === 'checking' ? (
              <p className="ai-panel__message" role="status">
                Looking for Llama on this computer…
              </p>
            ) : (
              <button type="button" className="ai-link" onClick={() => ai.showSetup()}>
                How to set it up →
              </button>
            )}
          </div>
          {status.kind === 'off' && <p className="ai-panel__message">{AI_REQUIREMENT}</p>}
        </div>
      );
    case 'setup':
      return <SetupPanel missing={status.missing} />;
    case 'ready':
      if (!eligible) return null;
      if (!explanation || explanation.state === 'pending') {
        return (
          <div className="ai-panel">
            <p className="ai-panel__message" role="status">
              Llama is writing an explanation…
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
      return null; // done: the card shows the AI text; rejected: the built-in text stays
  }
}
