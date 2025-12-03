export type MBTIGroup = 'Analysts' | 'Diplomats' | 'Sentinels' | 'Explorers';

export interface MBTIType {
  code: string;
  name: string;
  group: MBTIGroup;
  description: string;
  keywords: string[];
  color: string;
  bgGradient: string;
}

export interface ArtStyle {
  id: string;
  name: string;
  promptModifier: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface GeneratedImageState {
  data: string | null;
  loading: boolean;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  data: string;
  mbtiCode: string;
  styleId: string;
  gender: 'Male' | 'Female' | 'Non-binary';
  size: ImageSize;
  timestamp: number;
}
