/**
 * Cooking techniques analysis and scoring system
 * Based on analysis of 176 recipes from FoodStalker
 */

export interface CookingTechnique {
  name: string;
  difficulty: 1 | 2 | 3; // 1 = basic, 2 = intermediate, 3 = advanced
  category: "basic" | "intermediate" | "advanced";
  keywords: string[];
  description?: string;
}

export interface TechniqueAnalysis {
  techniques: CookingTechnique[];
  totalScore: number;
  maxDifficulty: number;
  techniqueCount: number;
  breakdown: {
    basic: number;
    intermediate: number;
    advanced: number;
  };
}

// Comprehensive cooking techniques database - sorted by difficulty level
export const COOKING_TECHNIQUES: Record<string, CookingTechnique> = {
  // ===== GRUNNLEGGENDE TEKNIKKER (difficulty: 1) =====
  kutt: {
    name: "kutt",
    difficulty: 1,
    category: "basic",
    keywords: ["kutt", "skjær", "del", "kutte opp"],
    description: "Grunnleggende kutting og skjæring",
  },
  hak: {
    name: "hak",
    difficulty: 1,
    category: "basic",
    keywords: ["hakke", "finhakk", "hakket"],
    description: "Hakking av ingredienser",
  },
  skrelle: {
    name: "skrelle",
    difficulty: 1,
    category: "basic",
    keywords: ["skrelle", "skrell", "skrell av"],
    description: "Skrelling av frukt og grønnsaker",
  },
  riv: {
    name: "riv",
    difficulty: 1,
    category: "basic",
    keywords: ["riv", "rive", "revet"],
    description: "Riving av ingredienser",
  },
  skive: {
    name: "skive",
    difficulty: 1,
    category: "basic",
    keywords: ["skive", "skiver", "skjære i skiver"],
    description: "Skjæring i tynne skiver",
  },
  knuse: {
    name: "knuse",
    difficulty: 1,
    category: "basic",
    keywords: ["knuse", "knust", "press"],
    description: "Knusing av ingredienser, f.eks. hvitløk",
  },
  bland: {
    name: "bland",
    difficulty: 1,
    category: "basic",
    keywords: ["blande", "røre", "miks"],
    description: "Blanding og røring av ingredienser",
  },
  krydre: {
    name: "krydre",
    difficulty: 1,
    category: "basic",
    keywords: ["krydre", "salt", "pepper"],
    description: "Krydring og smakstilsetting",
  },
  måle: {
    name: "måle",
    difficulty: 1,
    category: "basic",
    keywords: ["måle", "vei", "måle opp"],
    description: "Måling og veiing av ingredienser",
  },
  koke: {
    name: "koke",
    difficulty: 1,
    category: "basic",
    keywords: ["kok", "koke", "koking"],
    description: "Koking av vann, grønnsaker, pasta osv.",
  },
  smelte: {
    name: "smelte",
    difficulty: 1,
    category: "basic",
    keywords: ["smelte", "smeltet"],
    description: "Smelting av smør, sjokolade osv.",
  },
  server: {
    name: "server",
    difficulty: 1,
    category: "basic",
    keywords: ["servere", "legg opp"],
    description: "Servering og enkel presentasjon",
  },
  porsjonere: {
    name: "porsjonere",
    difficulty: 1,
    category: "basic",
    keywords: ["porsjonere", "dele", "fordele"],
    description: "Fordeling av mat i porsjoner",
  },

  // ===== UTFORDRENDE TEKNIKKER (difficulty: 2) =====
  stek: {
    name: "stek",
    difficulty: 1,
    category: "basic",
    keywords: ["steke", "stekepanne", "brune"],
    description: "Steking i panne",
  },
  bake: {
    name: "bake",
    difficulty: 2,
    category: "intermediate",
    keywords: ["bake", "kjøkkenmaskin"],
    description: "Baking i ovn",
  },
  visp: {
    name: "visp",
    difficulty: 1,
    category: "basic",
    keywords: ["vispe", "piske"],
    description: "Visping og pisking",
  },
  knead: {
    name: "elte",
    difficulty: 2,
    category: "intermediate",
    keywords: ["elte", "deig"],
    description: "Elting av deig",
  },
  saus: {
    name: "saus",
    difficulty: 2,
    category: "intermediate",
    keywords: ["saus", "dressing", "lage saus"],
    description: "Sauslaging og dressing",
  },
  marinere: {
    name: "marinere",
    difficulty: 2,
    category: "intermediate",
    keywords: ["marinere", "marinade"],
    description: "Marinering av ingredienser",
  },
  frese: {
    name: "frese",
    difficulty: 1,
    category: "basic",
    keywords: ["frese", "freser"],
    description: "Fresing på høy varme",
  },
  damp: {
    name: "damp",
    difficulty: 1,
    category: "basic",
    keywords: ["damp", "damping", "dampet"],
    description: "Damping av mat",
  },
  posjere: {
    name: "posjere",
    difficulty: 2,
    category: "intermediate",
    keywords: ["posjere", "posjert", "pochere"],
    description: "Posjering i væske under kokepunktet",
  },
  glasere: {
    name: "glasere",
    difficulty: 1,
    category: "basic",
    keywords: ["glasere", "glasur", "glasert"],
    description: "Glasering av grønnsaker eller kjøtt",
  },
  fritere: {
    name: "fritere",
    difficulty: 3,
    category: "advanced",
    keywords: ["fritere", "fritert", "friture"],
    description: "Fritering i olje",
  },
  grill: {
    name: "grill",
    difficulty: 2,
    category: "intermediate",
    keywords: ["grill", "grille", "grilling"],
    description: "Grilling på grill",
  },
  langkok: {
    name: "langkok",
    difficulty: 2,
    category: "intermediate",
    keywords: ["langkok", "langtidskok", "langkokt", "langtidskoking"],
    description: "Langkok og slow cooking",
  },
  sylte: {
    name: "sylte",
    difficulty: 1,
    category: "basic",
    keywords: ["sylte", "inlegging", "syltet", "sylting", "sylta"],
    description: "Sylting og konservering",
  },
  brunere: {
    name: "brune",
    difficulty: 1,
    category: "basic",
    keywords: ["brune", "bruning"],
    description: "Gi kjøtt eller grønnsaker farge og smak",
  },
  reduksjon: {
    name: "reduksjon",
    difficulty: 2,
    category: "intermediate",
    keywords: ["redusere", "tykne", "koke inn"],
    description: "Redusere væsker til tykkere konsistens",
  },
  emulsjon: {
    name: "emulsjon",
    difficulty: 3,
    category: "advanced",
    keywords: ["emulgere", "blande fett og væske"],
    description: "Lage emulsjoner som majones eller aioli",
  },
  panere: {
    name: "panere",
    difficulty: 2,
    category: "intermediate",
    keywords: ["panere", "mel", "egg", "brødsmuler"],
    description: "Vende i mel/egg/brødsmuler før steking",
  },

  // ===== AVANSERTE TEKNIKKER (difficulty: 3) =====
  heve: {
    name: "heve",
    difficulty: 1,
    category: "basic",
    keywords: ["heve", "heving", "gjærbakst"],
    description: "Heving og fermentering",
  },
  karamellisere: {
    name: "karamellisere",
    difficulty: 3,
    category: "advanced",
    keywords: [
      "karamellisere sukker",
      "karamellisere løk",
      "karamellisert løk",
      "karamellisert sukker",
    ],
    description: "Karamellisering av sukker eller løk",
  },
  flambere: {
    name: "flambere",
    difficulty: 3,
    category: "advanced",
    keywords: ["flambere", "flambering"],
    description: "Flambering med alkohol",
  },
  temper: {
    name: "temper",
    difficulty: 3,
    category: "advanced",
    keywords: ["temperere", "temperering"],
    description: "Temperering av sjokolade",
  },
  røyke: {
    name: "røyke",
    difficulty: 3,
    category: "advanced",
    keywords: ["røyke", "røyking", "røyket"],
    description: "Røyking av mat",
  },
  sous_vide: {
    name: "sous_vide",
    difficulty: 3,
    category: "advanced",
    keywords: ["sous vide", "vakuumkok"],
    description: "Sous-vide teknikk",
  },
  suffle: {
    name: "suffle",
    difficulty: 3,
    category: "advanced",
    keywords: ["sufflé", "souffle"],
    description: "Luftig sufflé som lett faller sammen",
  },
  filetering: {
    name: "filetering",
    difficulty: 3,
    category: "advanced",
    keywords: ["filetere", "fillettering", "utbening"],
    description: "Filetering av fisk eller kjøtt",
  },
  molekylær: {
    name: "molekylær",
    difficulty: 3,
    category: "advanced",
    keywords: ["molekylær gastronomi", "skum", "sfærer", "nitrogen"],
    description: "Moderne molekylær gastronomi teknikker",
  },
  konfitering: {
    name: "konfitering",
    difficulty: 3,
    category: "advanced",
    keywords: ["konfitering", "langtidskok i fett"],
    description: "Langtidskok i fett for smak og mørhet",
  },
  temperering: {
    name: "temperering",
    difficulty: 3,
    category: "advanced",
    keywords: ["temperere", "temperering sjokolade"],
    description: "Temperering av sjokolade for riktig struktur",
  },
};

/**
 * Analyze cooking techniques in recipe steps
 */
export function analyzeCookingTechniques(
  steps: Array<{ title?: string; description: string }>
): TechniqueAnalysis {
  const foundTechniques: CookingTechnique[] = [];
  const techniqueCounts: Record<string, number> = {};

  steps.forEach((step) => {
    const description = (step.description || "").toLowerCase();
    const title = (step.title || "").toLowerCase();
    const text = `${title} ${description}`;

    // Check all techniques
    Object.entries(COOKING_TECHNIQUES).forEach(([techniqueName, technique]) => {
      technique.keywords.forEach((keyword) => {
        if (text.includes(keyword.toLowerCase())) {
          if (!techniqueCounts[techniqueName]) {
            techniqueCounts[techniqueName] = 0;
            foundTechniques.push(technique);
          }
          techniqueCounts[techniqueName]++;
        }
      });
    });
  });

  // Calculate scores and breakdown
  const totalScore = foundTechniques.reduce(
    (sum, technique) => sum + technique.difficulty,
    0
  );
  const maxDifficulty =
    foundTechniques.length > 0
      ? Math.max(...foundTechniques.map((t) => t.difficulty))
      : 0;

  const breakdown = {
    basic: foundTechniques.filter((t) => t.difficulty === 1).length,
    intermediate: foundTechniques.filter((t) => t.difficulty === 2).length,
    advanced: foundTechniques.filter((t) => t.difficulty === 3).length,
  };

  return {
    techniques: foundTechniques,
    totalScore,
    maxDifficulty,
    techniqueCount: foundTechniques.length,
    breakdown,
  };
}

/**
 * Get technique difficulty score for difficulty calculation
 * Returns a score from 0-100 where higher = more difficult
 */
export function getTechniqueDifficultyScore(
  analysis: TechniqueAnalysis
): number {
  if (analysis.techniqueCount === 0) return 20; // Default to easy if no techniques found

  // Base score from max difficulty
  let baseScore = 0;
  switch (analysis.maxDifficulty) {
    case 1:
      baseScore = 20;
      break;
    case 2:
      baseScore = 50;
      break;
    case 3:
      baseScore = 80;
      break;
    default:
      baseScore = 20;
  }

  // Bonus for multiple advanced techniques
  if (analysis.breakdown.advanced > 0) {
    baseScore += Math.min(analysis.breakdown.advanced * 5, 20);
  }

  // Bonus for high technique count (complexity)
  if (analysis.techniqueCount > 5) {
    baseScore += Math.min((analysis.techniqueCount - 5) * 2, 10);
  }

  return Math.min(baseScore, 100);
}

/**
 * Get technique summary for display
 */
export function getTechniqueSummary(analysis: TechniqueAnalysis): string {
  if (analysis.techniqueCount === 0) return "Ingen spesielle teknikker";

  const techniques = analysis.techniques.map((t) => t.name).join(", ");
  const difficulty =
    analysis.maxDifficulty === 1
      ? "grunnleggende"
      : analysis.maxDifficulty === 2
      ? "middels"
      : "avanserte";

  return `${analysis.techniqueCount} ${difficulty} teknikker: ${techniques}`;
}
