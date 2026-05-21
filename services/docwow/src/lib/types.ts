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
  confidence?: number; // Textract OCR confidence 0-100
}

export interface AnalysisProfile {
  template: 'patient' | 'provider' | 'reviewer' | 'custom';
  role: string;
  goal: string;
  questions?: string[];
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface PendingChat {
  chatId: string;
  status: 'processing' | 'ready' | 'failed';
  answer?: string;
  citations?: Citation[];
  error?: string;
}

export interface DocSession {
  sessionId: string;
  s3Key: string;
  profile: AnalysisProfile;
  blocks: ExtractedBlock[];
  pageCount: number;
  history: ChatTurn[];
  textractJobId?: string;
  status: 'processing' | 'ready';
  suggestedQuestions?: string[];
  pendingChat?: PendingChat;
  createdAt: string;
  ttl: number;
}
