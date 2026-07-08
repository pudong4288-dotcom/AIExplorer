export type EducationalResource = {
  title: string;
  type: string;
  url: string;
};

export type AnalysisResult = {
  name: string;
  scientificName?: string | null;
  confidence: number;
  summary: string;
  facts: string[];
  resources: EducationalResource[];
};

export type SelectedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export type RecentScan = {
  id: string;
  imageUri: string;
  name: string;
  summary: string;
  createdAt: string;
};
