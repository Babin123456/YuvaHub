export interface RecommendationCandidate {
  id: string;
  title: string;
  category?: string;
  organization?: string;
  source_name?: string;
  tags?: string[];
  matchScore: number;
  relevanceScore?: number;
  diversityScore?: number;
  finalScore?: number;
  deadline?: string;
}

export interface MMRConfig {
  /**
   * Lambda trade-off parameter between 0 and 1.
   * 1.0 = Pure relevance (greedy ranking)
   * 0.0 = Pure diversity (maximum dissimilarity)
   * Recommended default: 0.7
   */
  lambda?: number;
  maxResults?: number;
  categoryEntropyWeight?: number;
}
