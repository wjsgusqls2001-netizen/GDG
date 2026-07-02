export interface BlogPostInput {
  region: string;
  storeName: string;
  placeLink: string;
  mainKeyword: string;
  detailedKeywords: string;
  extraInfo: string;
  persona: string;
}

export interface BlogPostResponse {
  title: string;
  content: string;
  hashtags: string[];
}

export interface DetailedKeywordStatus {
  keyword: string;
  found: boolean;
  count: number;
}

export interface SEOAnalysis {
  characterCount: number;
  isLengthOk: boolean;
  mainKeywordCount: number;
  isMainKeywordOk: boolean;
  detailedKeywords: DetailedKeywordStatus[];
  hasIntro: boolean;
  hasVisit: boolean;
  hasMenu: boolean;
  hasVibe: boolean;
  hasSummary: boolean;
}

export interface SavedDraft {
  id: string;
  title: string;
  createdAt: string;
  input: BlogPostInput;
  output: BlogPostResponse;
}
