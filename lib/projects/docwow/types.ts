export type BlockType = 'text' | 'table' | 'key-value';

export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ExtractedBlock {
  id: string;
  pageNumber: number;
  type: BlockType;
  text: string;
  bbox: BoundingBox;
  confidence: number;
}

export interface Citation {
  pageNumber: number;
  blockId: string;
  quote: string;
  type: BlockType;
  bbox: BoundingBox;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export interface AnalysisProfile {
  template: 'patient' | 'provider' | 'reviewer' | 'custom';
  role: string;
  goal: string;
  questions?: string[]; // Optional user-supplied questions pre-populated in chat
}

export interface SampleDoc {
  id: string;
  label: string;
  description: string;
  filename: string;
  pageCount: number;
  suggestedQuestions: string[];
}

export type DemoPhase =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'processing'; stage: string; pagesProcessed?: number }
  | { status: 'ready'; sessionId: string; pageCount: number; blocks: ExtractedBlock[] }
  | { status: 'error'; message: string };

export interface ActiveCitation extends Citation {
  blockId: string;
}
