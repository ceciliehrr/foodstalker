// Felles tilstand per oppskrift (porsjoner + avkryssede ingredienser/steg),
// delt mellom Ingredients.vue og CookingMode.vue og lagret i localStorage
// slik at valgene overlever reload.
import { onMounted, reactive, watch } from "vue";

export interface RecipeState {
  portion: number;
  ingredients: Record<string, boolean>;
  steps: Record<string, boolean>;
}

// Avkrysninger fra en gammel matlaging skal ikke henge igjen neste gang
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 timer

const states = new Map<string, RecipeState>();
const restored = new Set<string>();
const storageKey = (recipeId: string) => `fs-recipe-state:${recipeId}`;

function load(recipeId: string): Partial<RecipeState> | null {
  try {
    const raw = localStorage.getItem(storageKey(recipeId));
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved.savedAt || Date.now() - saved.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(storageKey(recipeId));
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

// Kalles fra setup(). Lagrede valg leses inn først i onMounted, slik at
// server-rendret HTML (client:idle) og første klient-render er like.
export function useRecipeState(
  recipeId: string,
  defaultPortion: number
): RecipeState {
  const state = states.get(recipeId) ?? createState(recipeId, defaultPortion);

  onMounted(() => {
    if (restored.has(recipeId)) return;
    restored.add(recipeId);
    const saved = load(recipeId);
    if (!saved) return;
    if (typeof saved.portion === "number" && saved.portion > 0) {
      state.portion = saved.portion;
    }
    state.ingredients = saved.ingredients ?? {};
    state.steps = saved.steps ?? {};
  });

  return state;
}

function createState(recipeId: string, defaultPortion: number): RecipeState {
  const state = reactive<RecipeState>({
    portion: defaultPortion,
    ingredients: {},
    steps: {},
  });

  watch(
    state,
    () => {
      try {
        localStorage.setItem(
          storageKey(recipeId),
          JSON.stringify({ ...state, savedAt: Date.now() })
        );
      } catch {
        // localStorage kan være blokkert (privat modus o.l.) – da huskes ingenting
      }
    },
    { deep: true }
  );

  states.set(recipeId, state);
  return state;
}

export function resetRecipeState(recipeId: string, defaultPortion: number) {
  const state = states.get(recipeId);
  if (!state) return;
  state.portion = defaultPortion;
  state.ingredients = {};
  state.steps = {};
}
