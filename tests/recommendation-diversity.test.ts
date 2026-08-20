import { describe, it, expect } from 'vitest';
import {
  calculateItemSimilarity,
  reRankWithMMR,
} from '../src/services/recommendationDiversity';
import { RecommendationCandidate } from '../src/types/recommendation';

describe('Recommendation Diversity & MMR Re-Ranking', () => {
  const sampleCandidates: RecommendationCandidate[] = [
    {
      id: 'opp-1',
      title: 'AI Vision Hackathon',
      category: 'Hackathon',
      tags: ['ai', 'python', 'vision'],
      matchScore: 98,
    },
    {
      id: 'opp-2',
      title: 'AI LLM Hackathon',
      category: 'Hackathon',
      tags: ['ai', 'python', 'llm'],
      matchScore: 96,
    },
    {
      id: 'opp-3',
      title: 'Open Source Security Grant',
      category: 'Grant',
      tags: ['security', 'rust', 'opensource'],
      matchScore: 90,
    },
    {
      id: 'opp-4',
      title: 'Climate Tech Fellowship',
      category: 'Fellowship',
      tags: ['climate', 'hardware', 'research'],
      matchScore: 88,
    },
  ];

  describe('Item Similarity Calculation', () => {
    it('returns 1.0 for identical item IDs', () => {
      expect(calculateItemSimilarity(sampleCandidates[0], sampleCandidates[0])).toBe(1.0);
    });

    it('scores higher similarity for items in the same category sharing tags', () => {
      const simSameCategory = calculateItemSimilarity(sampleCandidates[0], sampleCandidates[1]);
      const simDifferentCategory = calculateItemSimilarity(sampleCandidates[0], sampleCandidates[2]);

      expect(simSameCategory).toBeGreaterThan(simDifferentCategory);
    });
  });

  describe('MMR Diversity Re-Ranking', () => {
    it('returns candidate set in greedy relevance order when lambda = 1.0', () => {
      const ranked = reRankWithMMR(sampleCandidates, { lambda: 1.0 });
      expect(ranked[0].id).toBe('opp-1');
      expect(ranked[1].id).toBe('opp-2');
    });

    it('promotes non-redundant categories higher when lambda favors diversity (0.3)', () => {
      const ranked = reRankWithMMR(sampleCandidates, { lambda: 0.3 });
      
      // First is top relevance
      expect(ranked[0].id).toBe('opp-1');
      // Second item should diversify away from hackathon (Grant or Fellowship promoted over opp-2)
      expect(ranked[1].category).not.toBe('Hackathon');
    });

    it('handles empty candidates safely', () => {
      expect(reRankWithMMR([])).toEqual([]);
    });
  });
});
