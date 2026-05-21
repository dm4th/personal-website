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

export interface AnalysisProfile {
  template: 'patient' | 'provider' | 'reviewer' | 'custom';
  role: string;
  goal: string;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface DocSession {
  sessionId: string;
  s3Key: string;
  profile: AnalysisProfile;
  blocks: ExtractedBlock[];
  pageCount: number;
  history: ChatTurn[];
  createdAt: string;
  ttl: number;
}
