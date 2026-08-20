import { RecommendationCandidate, MMRConfig } from '../types/recommendation';

/**
 * Calculate Jaccard similarity between two items based on tags and category
 */
export function calculateItemSimilarity(a: RecommendationCandidate, b: RecommendationCandidate): number {
  if (a.id === b.id) return 1.0;

  let score = 0;
  let totalWeights = 0;

  // Category match
  if (a.category && b.category) {
    totalWeights += 0.5;
    if (a.category.toLowerCase() === b.category.toLowerCase()) {
      score += 0.5;
    }
  }

  // Tag overlap (Jaccard similarity)
  const tagsA = new Set((a.tags || []).map((t) => t.toLowerCase()));
  const tagsB = new Set((b.tags || []).map((t) => t.toLowerCase()));

  if (tagsA.size > 0 || tagsB.size > 0) {
    totalWeights += 0.5;
    let intersection = 0;
    for (const tag of tagsA) {
      if (tagsB.has(tag)) intersection++;
    }
    const union = new Set([...tagsA, ...tagsB]).size;
    if (union > 0) {
      score += 0.5 * (intersection / union);
    }
  }

  return totalWeights > 0 ? score / totalWeights : 0;
}

/**
 * Maximal Marginal Relevance (MMR) Re-Ranking Algorithm
 * Re-ranks candidate recommendations to eliminate filter bubble redundancy.
 */
export function reRankWithMMR(
  candidates: RecommendationCandidate[],
  config: MMRConfig = {}
): RecommendationCandidate[] {
  const { lambda = 0.7, maxResults = candidates.length } = config;

  if (candidates.length === 0) return [];
  if (candidates.length <= 2) return [...candidates];

  const unselected = [...candidates];
  const selected: RecommendationCandidate[] = [];

  // 1. Pick top relevance item first
  unselected.sort((a, b) => b.matchScore - a.matchScore);
  const first = unselected.shift()!;
  first.finalScore = first.matchScore;
  selected.push(first);

  // 2. Iteratively select next item maximizing MMR formula:
  // MMR = argmax [ lambda * Sim1(item, query) - (1 - lambda) * max_{j in Selected} Sim2(item, j) ]
  while (unselected.length > 0 && selected.length < maxResults) {
    let bestIndex = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < unselected.length; i++) {
      const candidate = unselected[i];

      // Normalize matchScore to 0..1 scale
      const relevance = candidate.matchScore > 1 ? candidate.matchScore / 100 : candidate.matchScore;

      // Max similarity with any already selected item
      let maxSimWithSelected = 0;
      for (const sel of selected) {
        const sim = calculateItemSimilarity(candidate, sel);
        if (sim > maxSimWithSelected) {
          maxSimWithSelected = sim;
        }
      }

      const mmrScore = lambda * relevance - (1 - lambda) * maxSimWithSelected;

      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIndex = i;
      }
    }

    if (bestIndex >= 0) {
      const [chosen] = unselected.splice(bestIndex, 1);
      chosen.finalScore = Math.round((bestScore + 1) * 50); // Scale back to 0-100 preview score
      selected.push(chosen);
    } else {
      break;
    }
  }

  return selected;
}
