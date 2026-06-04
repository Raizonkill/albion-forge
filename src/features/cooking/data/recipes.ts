export interface Ingredient {
  id: string
  name: string
  qty: number
}

export interface CookingRecipe {
  id: string
  name: string
  /** Mastery branch (Sopas, Guisos, ...). */
  tipo: string
  /** Base focus cost at enchant .0, before mastery. */
  focusBase: number
  /** Units produced per batch. */
  unidades: number
  /** Avalonian energy consumed (0 for standard recipes). */
  energiaAva: number
  avalon?: boolean
  ingredientes: Ingredient[]
}

// Enchant sauce ids (index = enchant level). Verified against ao-bin-dumps.
export const SAUCE_IDS = ["", "T1_FISHSAUCE_LEVEL1", "T1_FISHSAUCE_LEVEL2", "T1_FISHSAUCE_LEVEL3"]
export const AVALON_ENERGY_ID = "QUESTITEM_TOKEN_AVALON"

/** Focus multiplier per enchant level (.0 -> .3). */
export const FOCUS_ENCHANT_SCALE = [1, 1.3421, 1.8012, 2.4184]

/** Meal market id for a given enchant level. */
export function mealItemId(baseId: string, enchant: number): string {
  return enchant === 0 ? baseId : `${baseId}@${enchant}`
}

export const COOKING_BRANCHES = [
  "Sopas",
  "Ensaladas",
  "Pasteles",
  "Tortillas",
  "Asados",
  "Guisos",
  "Bocadillos",
] as const

// 21 standard recipes (T1-T8). Ingredient ids corrected to the current Albion scheme
// (the prototype's ids were stale). Fish/Avalonian recipes pending authoritative recipe data.
export const COOKING_RECIPES: CookingRecipe[] = [
  { id: "T1_MEAL_SOUP", name: "Sopa de Zanahorias", tipo: "Sopas", focusBase: 560, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T1_CARROT", name: "Carrots", qty: 16 }] },
  { id: "T2_MEAL_SALAD", name: "Ensalada de Frijoles", tipo: "Ensaladas", focusBase: 560, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T2_BEAN", name: "Beans", qty: 8 }, { id: "T1_CARROT", name: "Carrots", qty: 8 }] },
  { id: "T3_MEAL_SOUP", name: "Sopa de Trigo", tipo: "Sopas", focusBase: 1680, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T3_WHEAT", name: "Wheat", qty: 48 }] },
  { id: "T3_MEAL_PIE", name: "Pastel de Pollo", tipo: "Pasteles", focusBase: 530, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T3_WHEAT", name: "Wheat", qty: 2 }, { id: "T3_FLOUR", name: "Flour", qty: 4 }, { id: "T3_MEAT", name: "Raw Chicken", qty: 8 }] },
  { id: "T3_MEAL_OMELETTE", name: "Tortilla de Pollo", tipo: "Tortillas", focusBase: 520, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T3_WHEAT", name: "Wheat", qty: 4 }, { id: "T3_MEAT", name: "Raw Chicken", qty: 8 }, { id: "T3_EGG", name: "Hen Eggs", qty: 2 }] },
  { id: "T3_MEAL_ROAST", name: "Pollo Asado", tipo: "Asados", focusBase: 580, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T3_MEAT", name: "Raw Chicken", qty: 8 }, { id: "T2_BEAN", name: "Beans", qty: 4 }, { id: "T4_MILK", name: "Goat's Milk", qty: 4 }] },
  { id: "T4_MEAL_SALAD", name: "Ensalada de Rabanos", tipo: "Ensaladas", focusBase: 1680, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T4_TURNIP", name: "Turnip", qty: 24 }, { id: "T3_WHEAT", name: "Wheat", qty: 24 }] },
  { id: "T4_MEAL_STEW", name: "Guiso de Cabra", tipo: "Guisos", focusBase: 610, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T4_TURNIP", name: "Turnip", qty: 4 }, { id: "T4_BREAD", name: "Bread", qty: 4 }, { id: "T4_MEAT", name: "Raw Goat", qty: 8 }] },
  { id: "T4_MEAL_SANDWICH", name: "Bocadillo de Cabra", tipo: "Bocadillos", focusBase: 550, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T4_BUTTER", name: "Goat's Butter", qty: 2 }, { id: "T4_BREAD", name: "Bread", qty: 4 }, { id: "T4_MEAT", name: "Raw Goat", qty: 8 }] },
  { id: "T5_MEAL_SOUP", name: "Sopa de Col", tipo: "Sopas", focusBase: 5040, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T5_CABBAGE", name: "Cabbage", qty: 144 }] },
  { id: "T5_MEAL_PIE", name: "Pastel de Ganso", tipo: "Pasteles", focusBase: 1800, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T5_CABBAGE", name: "Cabbage", qty: 6 }, { id: "T3_FLOUR", name: "Flour", qty: 12 }, { id: "T5_MEAT", name: "Raw Goose", qty: 24 }, { id: "T4_MILK", name: "Goat's Milk", qty: 6 }] },
  { id: "T5_MEAL_OMELETTE", name: "Tortilla de Ganso", tipo: "Tortillas", focusBase: 1550, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T5_CABBAGE", name: "Cabbage", qty: 12 }, { id: "T5_MEAT", name: "Raw Goose", qty: 24 }, { id: "T5_EGG", name: "Goose Eggs", qty: 6 }] },
  { id: "T5_MEAL_ROAST", name: "Ganso Asado", tipo: "Asados", focusBase: 1760, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T5_MEAT", name: "Raw Goose", qty: 24 }, { id: "T5_CABBAGE", name: "Cabbage", qty: 12 }, { id: "T6_MILK", name: "Sheep's Milk", qty: 12 }] },
  { id: "T6_MEAL_SALAD", name: "Ensalada de Patatas", tipo: "Ensaladas", focusBase: 5040, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T5_CABBAGE", name: "Cabbage", qty: 72 }, { id: "T6_POTATO", name: "Potato", qty: 72 }] },
  { id: "T6_MEAL_STEW", name: "Guiso de Carnero", tipo: "Guisos", focusBase: 1840, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T6_POTATO", name: "Potato", qty: 12 }, { id: "T4_BREAD", name: "Bread", qty: 12 }, { id: "T6_MEAT", name: "Raw Mutton", qty: 24 }] },
  { id: "T6_MEAL_SANDWICH", name: "Bocadillo de Carnero", tipo: "Bocadillos", focusBase: 1650, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T6_BUTTER", name: "Sheep's Butter", qty: 6 }, { id: "T4_BREAD", name: "Bread", qty: 12 }, { id: "T6_MEAT", name: "Raw Mutton", qty: 24 }] },
  { id: "T7_MEAL_PIE", name: "Pastel de Cerdo", tipo: "Pasteles", focusBase: 5400, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T7_MEAT", name: "Raw Pork", qty: 72 }, { id: "T3_FLOUR", name: "Flour", qty: 36 }, { id: "T7_CORN", name: "Corn", qty: 18 }, { id: "T6_MILK", name: "Sheep's Milk", qty: 18 }] },
  { id: "T7_MEAL_OMELETTE", name: "Tortilla de Cerdo", tipo: "Tortillas", focusBase: 4640, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T7_CORN", name: "Corn", qty: 36 }, { id: "T5_EGG", name: "Goose Eggs", qty: 18 }, { id: "T7_MEAT", name: "Raw Pork", qty: 72 }] },
  { id: "T7_MEAL_ROAST", name: "Cerdo Asado", tipo: "Asados", focusBase: 5280, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T7_CORN", name: "Corn", qty: 36 }, { id: "T7_MEAT", name: "Raw Pork", qty: 72 }, { id: "T8_MILK", name: "Cow's Milk", qty: 36 }] },
  { id: "T8_MEAL_STEW", name: "Guiso de Ternera", tipo: "Guisos", focusBase: 5510, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T8_MEAT", name: "Raw Beef", qty: 72 }, { id: "T8_PUMPKIN", name: "Pumpkin", qty: 36 }, { id: "T4_BREAD", name: "Bread", qty: 36 }] },
  { id: "T8_MEAL_SANDWICH", name: "Bocadillo de Ternera", tipo: "Bocadillos", focusBase: 4940, unidades: 10, energiaAva: 0,
    ingredientes: [{ id: "T8_MEAT", name: "Raw Beef", qty: 72 }, { id: "T4_BREAD", name: "Bread", qty: 36 }, { id: "T8_BUTTER", name: "Cow's Butter", qty: 18 }] },
]
