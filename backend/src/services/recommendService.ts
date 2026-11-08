import { ProductService, ProductDto } from './productService.js';
import { USAGE_PROFILES, UsageProfileKey, Category } from '../config/usageProfiles.js';

export interface RecommendParams {
  category: Category;
  budgetMaxPaise?: number; // In paise
  usage?: UsageProfileKey;
  priorities?: string[];
  brands?: string[];
  limit?: number;
}

export interface ProductScoreBreakdown {
  budgetFit: number;      // 0..1
  usageFit: number;       // 0..1
  priorityMatch: number;  // 0..1
  ratingScore: number;    // 0..1
  brandFit: number;       // 0..1
}

export interface ScoredProduct {
  product: ProductDto;
  overallScore: number; // 0..100
  breakdown: ProductScoreBreakdown;
  matchedRequirements: string[];
  tradeoffs: string[];
  rankingReason: string;
}

export class RecommendService {
  static rankProducts(params: RecommendParams): ScoredProduct[] {
    const { category, budgetMaxPaise, usage = 'everyday', priorities = [], brands = [], limit = 4 } = params;

    // Fetch candidate products for the category
    const { products } = ProductService.getAllProducts({
      category,
      maxPricePaise: budgetMaxPaise, // HARD CONSTRAINT: strictly exclude products over budget
      limit: 100,
    });

    if (products.length === 0) {
      return [];
    }

    const profile = USAGE_PROFILES[usage] || USAGE_PROFILES.everyday;
    const categoryRules = profile.categoryRules[category] || [];

    // Base weights
    let wBudget = 0.25;
    let wUsage = 0.30;
    let wPriority = 0.25;
    let wRating = 0.10;
    let wBrand = 0.10;

    // If budget is not specified, renormalize
    if (!budgetMaxPaise) {
      wBudget = 0.05;
      wUsage = 0.40;
      wPriority = 0.35;
      wRating = 0.10;
      wBrand = 0.10;
    }

    const scoredList: ScoredProduct[] = products.map(product => {
      const specs = product.specs || {};
      const matchedReqs: string[] = [];
      const tradeoffs: string[] = [];

      // 1. Budget Fit Score
      let budgetFit = 1.0;
      if (budgetMaxPaise) {
        if (product.price_inr_paise <= budgetMaxPaise * 0.85) {
          budgetFit = 1.0;
          const savingsPaise = budgetMaxPaise - product.price_inr_paise;
          if (savingsPaise > 0) {
            matchedReqs.push(`Well within budget (₹${Math.round(savingsPaise / 100).toLocaleString('en-IN')} headroom)`);
          }
        } else {
          // Linearly decrease between 85% and 100%
          const range = budgetMaxPaise * 0.15;
          const excessOver85 = product.price_inr_paise - (budgetMaxPaise * 0.85);
          budgetFit = Math.max(0, 1.0 - (excessOver85 / range));
          tradeoffs.push('Close to the maximum budget limit');
        }
      }

      // 2. Usage Fit Score
      let usageScoreSum = 0;
      let totalRuleWeight = 0;

      for (const rule of categoryRules) {
        totalRuleWeight += rule.weight;
        const val = specs[rule.field];

        if (rule.min !== undefined) {
          if (typeof val === 'number') {
            if (val >= rule.min) {
              usageScoreSum += 1.0 * rule.weight;
              matchedReqs.push(rule.description);
            } else {
              const fraction = Math.max(0, val / rule.min);
              usageScoreSum += fraction * rule.weight;
              tradeoffs.push(`Lower ${rule.field.replace('_', ' ')} (${val}) than recommended (${rule.min})`);
            }
          } else {
            usageScoreSum += 0.5 * rule.weight;
          }
        } else if (rule.max !== undefined) {
          if (typeof val === 'number') {
            if (val <= rule.max) {
              usageScoreSum += 1.0 * rule.weight;
              matchedReqs.push(rule.description);
            } else {
              const fraction = Math.max(0, 1.0 - ((val - rule.max) / rule.max));
              usageScoreSum += fraction * rule.weight;
              tradeoffs.push(`Heavier/higher ${rule.field.replace('_', ' ')} (${val}) than optimal (${rule.max})`);
            }
          } else {
            usageScoreSum += 0.5 * rule.weight;
          }
        } else if (rule.expected !== undefined) {
          if (typeof rule.expected === 'boolean') {
            if (val === rule.expected) {
              usageScoreSum += 1.0 * rule.weight;
              matchedReqs.push(rule.description);
            } else {
              usageScoreSum += 0;
              tradeoffs.push(`Lacks ${rule.field.replace('_', ' ')}`);
            }
          } else if (Array.isArray(rule.expected)) {
            const matches = rule.expected.some(exp =>
              String(val || '').toLowerCase().includes(exp.toLowerCase())
            );
            if (matches) {
              usageScoreSum += 1.0 * rule.weight;
              matchedReqs.push(rule.description);
            } else {
              usageScoreSum += 0.2;
              tradeoffs.push(`Standard ${rule.field.replace('_', ' ')}`);
            }
          }
        }
      }

      const usageFit = totalRuleWeight > 0 ? usageScoreSum / totalRuleWeight : 0.8;

      // 3. Priority Match Score
      let priorityMatch = 0.7; // default neutral baseline
      if (priorities.length > 0) {
        let pScores: number[] = [];
        for (const p of priorities) {
          const pLower = p.toLowerCase();
          if (pLower.includes('battery') || pLower.includes('endurance') || pLower.includes('life')) {
            if (specs.battery_hours) {
              // 6h -> 0.2, 10h -> 0.6, 12h -> 0.8, 14h+ -> 1.0
              const normalized = Math.min(1.0, Math.max(0.1, (specs.battery_hours - 4) / 10));
              pScores.push(normalized);
              if (specs.battery_hours >= 10) {
                matchedReqs.push(`High battery endurance: ${specs.battery_hours}h rating`);
              }
            } else if (specs.battery_mah) {
              // 4000 -> 0.33, 5000 -> 0.83, 5500 -> 1.0
              const normalized = Math.min(1.0, Math.max(0.1, (specs.battery_mah - 3500) / 1800));
              pScores.push(normalized);
            }
          } else if (pLower.includes('portab') || pLower.includes('light') || pLower.includes('weight')) {
            if (specs.weight_kg) {
              // 1.2kg -> 1.0, 2.3kg -> 0.1
              const normalized = Math.min(1.0, Math.max(0.1, (2.3 - specs.weight_kg) / 1.1));
              pScores.push(normalized);
              if (specs.weight_kg <= 1.4) {
                matchedReqs.push(`Featherlight portability: ${specs.weight_kg}kg`);
              }
            }
          } else if (pLower.includes('camera') || pLower.includes('photo')) {
            if (specs.camera_quality) {
              pScores.push(specs.camera_quality / 5.0);
              matchedReqs.push(`High-grade camera optics (${specs.camera_quality}/5.0)`);
            }
          } else if (pLower.includes('anc') || pLower.includes('noise')) {
            if (specs.anc === true) {
              pScores.push(1.0);
              matchedReqs.push('Active Noise Cancellation included');
            } else {
              pScores.push(0.1);
              tradeoffs.push('Passive noise isolation only');
            }
          } else if (pLower.includes('screen') || pLower.includes('display') || pLower.includes('refresh')) {
            if (specs.refresh_rate_hz && specs.refresh_rate_hz >= 120) {
              pScores.push(1.0);
              matchedReqs.push(`Fluid ${specs.refresh_rate_hz}Hz high-refresh rate`);
            } else if (specs.resolution && String(specs.resolution).includes('4K')) {
              pScores.push(1.0);
              matchedReqs.push('Ultra-sharp 4K UHD resolution');
            } else {
              pScores.push(0.5);
            }
          }
        }
        if (pScores.length > 0) {
          priorityMatch = pScores.reduce((a, b) => a + b, 0) / pScores.length;
        }
      }

      // 4. Rating Score (out of 5.0)
      const ratingScore = Math.min(1.0, Math.max(0, product.rating / 5.0));

      // 5. Brand Preference Score
      let brandFit = 0.5; // neutral
      if (brands.length > 0) {
        const matchesBrand = brands.some(b => b.toLowerCase() === product.brand.toLowerCase());
        brandFit = matchesBrand ? 1.0 : 0.0;
        if (matchesBrand) {
          matchedReqs.push(`Preferred brand: ${product.brand}`);
        }
      }

      // Calculate Weighted Overall Score (0..100)
      const weightedSum =
        (budgetFit * wBudget) +
        (usageFit * wUsage) +
        (priorityMatch * wPriority) +
        (ratingScore * wRating) +
        (brandFit * wBrand);

      const overallScore = Math.round(weightedSum * 100);

      // Generate precise ranking explanation
      const topMatch = matchedReqs[0] || 'Matches key baseline specifications';
      const rankingReason = `Scored ${overallScore}/100 for ${profile.name.toLowerCase()} requirements: ${topMatch}.`;

      return {
        product,
        overallScore,
        breakdown: {
          budgetFit: parseFloat(budgetFit.toFixed(2)),
          usageFit: parseFloat(usageFit.toFixed(2)),
          priorityMatch: parseFloat(priorityMatch.toFixed(2)),
          ratingScore: parseFloat(ratingScore.toFixed(2)),
          brandFit: parseFloat(brandFit.toFixed(2)),
        },
        matchedRequirements: Array.from(new Set(matchedReqs)),
        tradeoffs: Array.from(new Set(tradeoffs)),
        rankingReason,
      };
    });

    // Stable sort by overallScore desc, then rating desc, then lower price asc
    scoredList.sort((a, b) => {
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
      if (b.product.rating !== a.product.rating) {
        return b.product.rating - a.product.rating;
      }
      return a.product.price_inr_paise - b.product.price_inr_paise;
    });

    return scoredList.slice(0, limit);
  }
}
