export type EvidenceStatus = 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';

export interface QualityDimensionScore {
  category: string;
  weight: number;
  score: number;
  maxScore: number;
  evidenceStatus: EvidenceStatus;
  reason: string;
}

export interface ScoreResult {
  score: number;
  dimensions: QualityDimensionScore[];
}
