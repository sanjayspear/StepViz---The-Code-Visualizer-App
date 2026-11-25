// Messages between the page and the AI worker. The AI worker only ever
// receives chat text built from the trace; it never receives code to run.
import type { ChatMessage } from './prompt';

export type ToAiWorker =
  | { type: 'load'; libUrl: string }
  | { type: 'explain'; id: number; messages: ChatMessage[] }
  | { type: 'interrupt' }
  | { type: 'remove'; libUrl: string };

export type FromAiWorker =
  | { type: 'progress'; progress: number; text: string }
  | { type: 'ready' }
  | { type: 'load-error'; message: string }
  | { type: 'explained'; id: number; text: string }
  | { type: 'explain-error'; id: number; message: string }
  | { type: 'removed'; had: boolean };
