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
