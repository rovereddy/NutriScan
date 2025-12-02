
export enum HealthLevel {
  HEALTHY = 'HEALTHY',
  MODERATE = 'MODERATE',
  CONCERN = 'CONCERN',
  UNKNOWN = 'UNKNOWN'
}

export interface Ingredient {
  name: string;
  level: HealthLevel;
  reason: string;
  healthRisks?: string;
}

export interface AnalysisResult {
  id?: string;
  timestamp?: number;
  imageUrl?: string;
  summary: string;
  ingredients: Ingredient[];
  productName?: string;
}

export enum AppState {
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  PREVIEW = 'PREVIEW',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export type Language = 'en' | 'zh';
