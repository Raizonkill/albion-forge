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
  tier: number
  /** Units produced per craft (10 standard, 1 for special-fish recipes). */
  output: number
  /** Food nutrition value, used for the station usage fee. */
  nutrition: number
  avalon: boolean
  /** Total base focus per CRAFT (@craftingfocus x output), index = enchant level. */
  focusByEnchant: number[]
  /** Fish-sauce count per enchant level (0 at .0). */
  sauceByEnchant: number[]
  /** Base (.0) ingredients; includes Avalonian energy for avalon recipes. */
  ingredientes: Ingredient[]
}

/** Fish-sauce id per enchant level (index = level). */
export const SAUCE_IDS = ["", "T1_FISHSAUCE_LEVEL1", "T1_FISHSAUCE_LEVEL2", "T1_FISHSAUCE_LEVEL3"]

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

// Generated from ao-bin-dumps items.json (authoritative). focusByEnchant is the TOTAL
// focus per craft (@craftingfocus is per plate -> x output). 51 recipes.
export const COOKING_RECIPES: CookingRecipe[] = [
  { id: "T1_MEAL_SOUP", name: "Sopa de zanahoria", tipo: "Sopas", tier: 1, output: 10, nutrition: 77, avalon: false,
    focusByEnchant: [560, 780, 1230, 2560], sauceByEnchant: [0, 10, 10, 10],
    ingredientes: [{ id: "T1_CARROT", name: "Zanahorias", qty: 16 }] },
  { id: "T1_MEAL_SOUP_FISH", name: "Sopa de almeja verdosa", tipo: "Sopas", tier: 1, output: 1, nutrition: 106, avalon: false,
    focusByEnchant: [77, 144, 278, 678], sauceByEnchant: [0, 3, 3, 3],
    ingredientes: [{ id: "T3_FISH_FRESHWATER_SWAMP_RARE", name: "Almeja verdosa", qty: 1 }, { id: "T1_CARROT", name: "Zanahorias", qty: 2 }] },
  { id: "T2_MEAL_SALAD", name: "Ensalada de frijoles", tipo: "Ensaladas", tier: 2, output: 10, nutrition: 77, avalon: false,
    focusByEnchant: [560, 780, 1230, 2560], sauceByEnchant: [0, 10, 10, 10],
    ingredientes: [{ id: "T2_BEAN", name: "Frijoles", qty: 8 }, { id: "T1_CARROT", name: "Zanahorias", qty: 8 }] },
  { id: "T2_MEAL_SALAD_FISH", name: "Ensalada de calamar de aguas poco profundas", tipo: "Ensaladas", tier: 2, output: 1, nutrition: 106, avalon: false,
    focusByEnchant: [77, 144, 278, 678], sauceByEnchant: [0, 3, 3, 3],
    ingredientes: [{ id: "T3_FISH_SALTWATER_ALL_RARE", name: "Calamar de aguas poco profundas", qty: 1 }, { id: "T2_BEAN", name: "Frijoles", qty: 1 }, { id: "T2_AGARIC", name: "Ag\u00e1rico arcano", qty: 1 }] },
  { id: "T3_MEAL_OMELETTE", name: "Tortilla de pollo", tipo: "Tortillas", tier: 3, output: 10, nutrition: 77, avalon: false,
    focusByEnchant: [520, 740, 1180, 2520], sauceByEnchant: [0, 10, 10, 10],
    ingredientes: [{ id: "T3_WHEAT", name: "Manojo de trigo", qty: 4 }, { id: "T3_MEAT", name: "Carne de pollo", qty: 8 }, { id: "T3_EGG", name: "Huevos de gallina", qty: 2 }] },
  { id: "T3_MEAL_OMELETTE_AVALON", name: "Tortilla de pollo avaloniana", tipo: "Tortillas", tier: 3, output: 10, nutrition: 84, avalon: true,
    focusByEnchant: [520, 740, 1180, 2520], sauceByEnchant: [0, 10, 10, 10],
    ingredientes: [{ id: "T4_MILK", name: "Leche de cabra", qty: 4 }, { id: "T3_MEAT", name: "Carne de pollo", qty: 8 }, { id: "T3_EGG", name: "Huevos de gallina", qty: 2 }, { id: "QUESTITEM_TOKEN_AVALON", name: "QUESTITEM_TOKEN_AVALON", qty: 10 }] },
  { id: "T3_MEAL_OMELETTE_FISH", name: "Tortilla de cangrejo de r\u00edo abajo", tipo: "Tortillas", tier: 3, output: 1, nutrition: 116, avalon: false,
    focusByEnchant: [77, 144, 278, 678], sauceByEnchant: [0, 3, 3, 3],
    ingredientes: [{ id: "T3_FISH_FRESHWATER_STEPPE_RARE", name: "Cangrejo de r\u00edo abajo", qty: 1 }, { id: "T3_COMFREY", name: "Consuelda hojabrillante", qty: 1 }, { id: "T3_EGG", name: "Huevos de gallina", qty: 1 }] },
  { id: "T3_MEAL_PIE", name: "Pastel de pollo", tipo: "Pasteles", tier: 3, output: 10, nutrition: 78, avalon: false,
    focusByEnchant: [530, 750, 1200, 2530], sauceByEnchant: [0, 10, 10, 10],
    ingredientes: [{ id: "T3_WHEAT", name: "Manojo de trigo", qty: 2 }, { id: "T3_FLOUR", name: "Harina", qty: 4 }, { id: "T3_MEAT", name: "Carne de pollo", qty: 8 }] },
  { id: "T3_MEAL_PIE_FISH", name: "Pastel de ojo muerto de las sierras", tipo: "Pasteles", tier: 3, output: 1, nutrition: 120, avalon: false,
    focusByEnchant: [81, 147, 281, 681], sauceByEnchant: [0, 3, 3, 3],
    ingredientes: [{ id: "T3_FISH_FRESHWATER_MOUNTAIN_RARE", name: "Ojo muerto de las sierras", qty: 1 }, { id: "T3_FLOUR", name: "Harina", qty: 1 }, { id: "T3_EGG", name: "Huevos de gallina", qty: 1 }] },
  { id: "T3_MEAL_ROAST", name: "Pollo asado", tipo: "Asados", tier: 3, output: 10, nutrition: 87, avalon: false,
    focusByEnchant: [580, 810, 1250, 2590], sauceByEnchant: [0, 10, 10, 10],
    ingredientes: [{ id: "T3_MEAT", name: "Carne de pollo", qty: 8 }, { id: "T2_BEAN", name: "Frijoles", qty: 4 }, { id: "T4_MILK", name: "Leche de cabra", qty: 4 }] },
  { id: "T3_MEAL_ROAST_FISH", name: "Pargo de niebla blanca asado", tipo: "Asados", tier: 3, output: 1, nutrition: 116, avalon: false,
    focusByEnchant: [77, 144, 278, 678], sauceByEnchant: [0, 3, 3, 3],
    ingredientes: [{ id: "T3_FISH_FRESHWATER_AVALON_RARE", name: "Pargo de niebla blanca", qty: 1 }, { id: "T3_COMFREY", name: "Consuelda hojabrillante", qty: 1 }, { id: "T4_MILK", name: "Leche de cabra", qty: 1 }] },
  { id: "T3_MEAL_SOUP", name: "Sopa de trigo", tipo: "Sopas", tier: 3, output: 10, nutrition: 252, avalon: false,
    focusByEnchant: [1680, 2350, 3680, 7690], sauceByEnchant: [0, 30, 30, 30],
    ingredientes: [{ id: "T3_WHEAT", name: "Manojo de trigo", qty: 48 }] },
  { id: "T3_MEAL_SOUP_FISH", name: "Sopa de almeja de aguas turbias", tipo: "Sopas", tier: 3, output: 1, nutrition: 345, avalon: false,
    focusByEnchant: [231, 432, 832, 2033], sauceByEnchant: [0, 9, 9, 9],
    ingredientes: [{ id: "T5_FISH_FRESHWATER_SWAMP_RARE", name: "Almeja de aguas turbias", qty: 1 }, { id: "T3_WHEAT", name: "Manojo de trigo", qty: 2 }, { id: "T3_COMFREY", name: "Consuelda hojabrillante", qty: 2 }, { id: "T3_MEAT", name: "Carne de pollo", qty: 2 }] },
  { id: "T4_MEAL_SALAD", name: "Ensalada de r\u00e1bano", tipo: "Ensaladas", tier: 4, output: 10, nutrition: 252, avalon: false,
    focusByEnchant: [1680, 2350, 3680, 7690], sauceByEnchant: [0, 30, 30, 30],
    ingredientes: [{ id: "T4_TURNIP", name: "R\u00e1banos", qty: 24 }, { id: "T3_WHEAT", name: "Manojo de trigo", qty: 24 }] },
  { id: "T4_MEAL_SALAD_FISH", name: "Ensalada de pulpo de aguas medias", tipo: "Ensaladas", tier: 4, output: 1, nutrition: 345, avalon: false,
    focusByEnchant: [231, 432, 832, 2033], sauceByEnchant: [0, 9, 9, 9],
    ingredientes: [{ id: "T5_FISH_SALTWATER_ALL_RARE", name: "Pulpo de aguas medias", qty: 1 }, { id: "T4_TURNIP", name: "R\u00e1banos", qty: 2 }, { id: "T4_BURDOCK", name: "Bardana almenada", qty: 2 }, { id: "T4_MEAT", name: "Carne de cabra", qty: 2 }] },
  { id: "T4_MEAL_SANDWICH", name: "Bocadillo de cabra", tipo: "Bocadillos", tier: 4, output: 10, nutrition: 81, avalon: false,
    focusByEnchant: [550, 770, 1220, 2550], sauceByEnchant: [0, 10, 10, 10],
    ingredientes: [{ id: "T4_BREAD", name: "Pan", qty: 4 }, { id: "T4_MEAT", name: "Carne de cabra", qty: 8 }, { id: "T4_BUTTER", name: "Manteca de cabra", qty: 2 }] },
  { id: "T4_MEAL_SANDWICH_AVALON", name: "Bocadillo de cabra avaloniano", tipo: "Bocadillos", tier: 4, output: 10, nutrition: 88, avalon: true,
    focusByEnchant: [550, 770, 1220, 2550], sauceByEnchant: [0, 10, 10, 10],
    ingredientes: [{ id: "T4_BREAD", name: "Pan", qty: 4 }, { id: "T4_MEAT", name: "Carne de cabra", qty: 8 }, { id: "T4_BUTTER", name: "Manteca de cabra", qty: 2 }, { id: "QUESTITEM_TOKEN_AVALON", name: "QUESTITEM_TOKEN_AVALON", qty: 10 }] },
  { id: "T4_MEAL_SANDWICH_FISH", name: "Bocadillo de locha pedregosa", tipo: "Bocadillos", tier: 4, output: 1, nutrition: 120, avalon: false,
    focusByEnchant: [81, 147, 281, 681], sauceByEnchant: [0, 3, 3, 3],
    ingredientes: [{ id: "T3_FISH_FRESHWATER_HIGHLANDS_RARE", name: "Locha pedregosa", qty: 1 }, { id: "T4_TURNIP", name: "R\u00e1banos", qty: 1 }, { id: "T4_BUTTER", name: "Manteca de cabra", qty: 1 }] },
  { id: "T4_MEAL_STEW", name: "Guiso de cabra", tipo: "Guisos", tier: 4, output: 10, nutrition: 91, avalon: false,
    focusByEnchant: [610, 840, 1280, 2620], sauceByEnchant: [0, 10, 10, 10],
    ingredientes: [{ id: "T4_TURNIP", name: "R\u00e1banos", qty: 4 }, { id: "T4_BREAD", name: "Pan", qty: 4 }, { id: "T4_MEAT", name: "Carne de cabra", qty: 8 }] },
  { id: "T4_MEAL_STEW_AVALON", name: "Guiso de cabra avaloniano", tipo: "Guisos", tier: 4, output: 10, nutrition: 94, avalon: true,
    focusByEnchant: [580, 810, 1250, 2590], sauceByEnchant: [0, 10, 10, 10],
    ingredientes: [{ id: "T1_CARROT", name: "Zanahorias", qty: 4 }, { id: "T4_TURNIP", name: "R\u00e1banos", qty: 4 }, { id: "T4_MEAT", name: "Carne de cabra", qty: 8 }, { id: "QUESTITEM_TOKEN_AVALON", name: "QUESTITEM_TOKEN_AVALON", qty: 10 }] },
  { id: "T4_MEAL_STEW_FISH", name: "Guiso de anguila de agua verdosa", tipo: "Guisos", tier: 4, output: 1, nutrition: 116, avalon: false,
    focusByEnchant: [77, 144, 278, 678], sauceByEnchant: [0, 3, 3, 3],
    ingredientes: [{ id: "T3_FISH_FRESHWATER_FOREST_RARE", name: "Anguila de agua verdosa", qty: 1 }, { id: "T4_TURNIP", name: "R\u00e1banos", qty: 1 }, { id: "T4_BURDOCK", name: "Bardana almenada", qty: 1 }] },
  { id: "T5_MEAL_OMELETTE", name: "Tortilla de ganso", tipo: "Tortillas", tier: 5, output: 10, nutrition: 230, avalon: false,
    focusByEnchant: [1550, 2220, 3550, 7550], sauceByEnchant: [0, 30, 30, 30],
    ingredientes: [{ id: "T5_CABBAGE", name: "Coles", qty: 12 }, { id: "T5_MEAT", name: "Carne de ganso", qty: 24 }, { id: "T5_EGG", name: "Huevos de ganso", qty: 6 }] },
  { id: "T5_MEAL_OMELETTE_AVALON", name: "Tortilla de ganso avaloniana", tipo: "Tortillas", tier: 5, output: 10, nutrition: 252, avalon: true,
    focusByEnchant: [1550, 2220, 3550, 7550], sauceByEnchant: [0, 30, 30, 30],
    ingredientes: [{ id: "T6_MILK", name: "Leche de oveja", qty: 12 }, { id: "T5_MEAT", name: "Carne de ganso", qty: 24 }, { id: "T5_EGG", name: "Huevos de ganso", qty: 6 }, { id: "QUESTITEM_TOKEN_AVALON", name: "QUESTITEM_TOKEN_AVALON", qty: 30 }] },
  { id: "T5_MEAL_OMELETTE_FISH", name: "Tortilla de cangrejo de r\u00edo", tipo: "Tortillas", tier: 5, output: 1, nutrition: 337, avalon: false,
    focusByEnchant: [225, 425, 825, 2026], sauceByEnchant: [0, 9, 9, 9],
    ingredientes: [{ id: "T5_FISH_FRESHWATER_STEPPE_RARE", name: "Cangrejo de r\u00edo", qty: 1 }, { id: "T5_CABBAGE", name: "Coles", qty: 2 }, { id: "T5_TEASEL", name: "Cardo de drag\u00f3n", qty: 2 }, { id: "T5_EGG", name: "Huevos de ganso", qty: 2 }] },
  { id: "T5_MEAL_PIE", name: "Pastel de ganso", tipo: "Pasteles", tier: 5, output: 10, nutrition: 266, avalon: false,
    focusByEnchant: [1800, 2460, 3800, 7800], sauceByEnchant: [0, 30, 30, 30],
    ingredientes: [{ id: "T5_CABBAGE", name: "Coles", qty: 6 }, { id: "T3_FLOUR", name: "Harina", qty: 12 }, { id: "T5_MEAT", name: "Carne de ganso", qty: 24 }, { id: "T4_MILK", name: "Leche de cabra", qty: 6 }] },
  { id: "T5_MEAL_PIE_FISH", name: "Pastel de ojo muerto de las monta\u00f1as", tipo: "Pasteles", tier: 5, output: 1, nutrition: 337, avalon: false,
    focusByEnchant: [225, 425, 825, 2026], sauceByEnchant: [0, 9, 9, 9],
    ingredientes: [{ id: "T5_FISH_FRESHWATER_MOUNTAIN_RARE", name: "Ojo muerto de las monta\u00f1as", qty: 1 }, { id: "T5_CABBAGE", name: "Coles", qty: 2 }, { id: "T5_TEASEL", name: "Cardo de drag\u00f3n", qty: 2 }, { id: "T5_EGG", name: "Huevos de ganso", qty: 2 }] },
  { id: "T5_MEAL_ROAST", name: "Ganso asado", tipo: "Asados", tier: 5, output: 10, nutrition: 262, avalon: false,
    focusByEnchant: [1760, 2430, 3760, 7770], sauceByEnchant: [0, 30, 30, 30],
    ingredientes: [{ id: "T5_MEAT", name: "Carne de ganso", qty: 24 }, { id: "T5_CABBAGE", name: "Coles", qty: 12 }, { id: "T6_MILK", name: "Leche de oveja", qty: 12 }] },
  { id: "T5_MEAL_ROAST_FISH", name: "Pargo de niebla ligera asado", tipo: "Asados", tier: 5, output: 1, nutrition: 337, avalon: false,
    focusByEnchant: [225, 425, 825, 2026], sauceByEnchant: [0, 9, 9, 9],
    ingredientes: [{ id: "T5_FISH_FRESHWATER_AVALON_RARE", name: "Pargo de niebla ligera", qty: 1 }, { id: "T5_CABBAGE", name: "Coles", qty: 2 }, { id: "T5_TEASEL", name: "Cardo de drag\u00f3n", qty: 2 }, { id: "T6_MILK", name: "Leche de oveja", qty: 2 }] },
  { id: "T5_MEAL_SOUP", name: "Sopa de col", tipo: "Sopas", tier: 5, output: 10, nutrition: 756, avalon: false,
    focusByEnchant: [5040, 7040, 11050, 23060], sauceByEnchant: [0, 90, 90, 90],
    ingredientes: [{ id: "T5_CABBAGE", name: "Coles", qty: 144 }] },
  { id: "T5_MEAL_SOUP_FISH", name: "Sopa de almeja de pantano negro", tipo: "Sopas", tier: 5, output: 1, nutrition: 1002, avalon: false,
    focusByEnchant: [672, 1272, 2473, 6076], sauceByEnchant: [0, 27, 27, 27],
    ingredientes: [{ id: "T7_FISH_FRESHWATER_SWAMP_RARE", name: "Almeja de pantano negro", qty: 1 }, { id: "T5_CABBAGE", name: "Coles", qty: 6 }, { id: "T5_TEASEL", name: "Cardo de drag\u00f3n", qty: 6 }, { id: "T5_MEAT", name: "Carne de ganso", qty: 6 }] },
  { id: "T6_MEAL_SALAD", name: "Ensalada de patata", tipo: "Ensaladas", tier: 6, output: 10, nutrition: 756, avalon: false,
    focusByEnchant: [5040, 7040, 11050, 23060], sauceByEnchant: [0, 90, 90, 90],
    ingredientes: [{ id: "T6_POTATO", name: "Patatas", qty: 72 }, { id: "T5_CABBAGE", name: "Coles", qty: 72 }] },
  { id: "T6_MEAL_SALAD_FISH", name: "Ensalada de kraken de agua profunda", tipo: "Ensaladas", tier: 6, output: 1, nutrition: 1002, avalon: false,
    focusByEnchant: [672, 1272, 2473, 6076], sauceByEnchant: [0, 27, 27, 27],
    ingredientes: [{ id: "T7_FISH_SALTWATER_ALL_RARE", name: "Kraken de agua profunda", qty: 1 }, { id: "T6_POTATO", name: "Patatas", qty: 6 }, { id: "T6_FOXGLOVE", name: "Dedalera elusiva", qty: 6 }, { id: "T6_MEAT", name: "Carne de carnero", qty: 6 }] },
  { id: "T6_MEAL_SANDWICH", name: "Bocadillo de carnero", tipo: "Bocadillos", tier: 6, output: 10, nutrition: 243, avalon: false,
    focusByEnchant: [1650, 2310, 3650, 7650], sauceByEnchant: [0, 30, 30, 30],
    ingredientes: [{ id: "T4_BREAD", name: "Pan", qty: 12 }, { id: "T6_MEAT", name: "Carne de carnero", qty: 24 }, { id: "T6_BUTTER", name: "Manteca de oveja", qty: 6 }] },
  { id: "T6_MEAL_SANDWICH_AVALON", name: "Bocadillo de cordero avaloniano", tipo: "Bocadillos", tier: 6, output: 10, nutrition: 265, avalon: true,
    focusByEnchant: [1650, 2310, 3650, 7650], sauceByEnchant: [0, 30, 30, 30],
    ingredientes: [{ id: "T4_BREAD", name: "Pan", qty: 12 }, { id: "T6_MEAT", name: "Carne de carnero", qty: 24 }, { id: "T6_BUTTER", name: "Manteca de oveja", qty: 6 }, { id: "QUESTITEM_TOKEN_AVALON", name: "QUESTITEM_TOKEN_AVALON", qty: 30 }] },
  { id: "T6_MEAL_SANDWICH_FISH", name: "Bocadillo de locha de agua corriente", tipo: "Bocadillos", tier: 6, output: 1, nutrition: 345, avalon: false,
    focusByEnchant: [231, 432, 832, 2033], sauceByEnchant: [0, 9, 9, 9],
    ingredientes: [{ id: "T5_FISH_FRESHWATER_HIGHLANDS_RARE", name: "Locha de agua corriente", qty: 1 }, { id: "T6_POTATO", name: "Patatas", qty: 2 }, { id: "T6_FOXGLOVE", name: "Dedalera elusiva", qty: 2 }, { id: "T6_BUTTER", name: "Manteca de oveja", qty: 2 }] },
  { id: "T6_MEAL_STEW", name: "Guiso de carnero", tipo: "Guisos", tier: 6, output: 10, nutrition: 272, avalon: false,
    focusByEnchant: [1840, 2510, 3840, 7850], sauceByEnchant: [0, 30, 30, 30],
    ingredientes: [{ id: "T6_POTATO", name: "Patatas", qty: 12 }, { id: "T4_BREAD", name: "Pan", qty: 12 }, { id: "T6_MEAT", name: "Carne de carnero", qty: 24 }] },
  { id: "T6_MEAL_STEW_AVALON", name: "Guiso de cordero avaloniano", tipo: "Guisos", tier: 6, output: 10, nutrition: 283, avalon: true,
    focusByEnchant: [1760, 2430, 3760, 7770], sauceByEnchant: [0, 30, 30, 30],
    ingredientes: [{ id: "T5_CABBAGE", name: "Coles", qty: 12 }, { id: "T6_POTATO", name: "Patatas", qty: 12 }, { id: "T6_MEAT", name: "Carne de carnero", qty: 24 }, { id: "QUESTITEM_TOKEN_AVALON", name: "QUESTITEM_TOKEN_AVALON", qty: 30 }] },
  { id: "T6_MEAL_STEW_FISH", name: "Guiso de anguila rojiza", tipo: "Guisos", tier: 6, output: 1, nutrition: 337, avalon: false,
    focusByEnchant: [225, 425, 825, 2026], sauceByEnchant: [0, 9, 9, 9],
    ingredientes: [{ id: "T5_FISH_FRESHWATER_FOREST_RARE", name: "Anguila rojiza", qty: 1 }, { id: "T6_POTATO", name: "Patatas", qty: 2 }, { id: "T6_FOXGLOVE", name: "Dedalera elusiva", qty: 2 }, { id: "T6_MILK", name: "Leche de oveja", qty: 2 }] },
  { id: "T7_MEAL_OMELETTE", name: "Tortilla de cerdo", tipo: "Tortillas", tier: 7, output: 10, nutrition: 690, avalon: false,
    focusByEnchant: [4640, 6650, 10650, 22660], sauceByEnchant: [0, 90, 90, 90],
    ingredientes: [{ id: "T7_CORN", name: "Fardo de ma\u00edz", qty: 36 }, { id: "T7_MEAT", name: "Carne de cerdo", qty: 72 }, { id: "T5_EGG", name: "Huevos de ganso", qty: 18 }] },
  { id: "T7_MEAL_OMELETTE_AVALON", name: "Tortilla de cerdo avaloniana", tipo: "Tortillas", tier: 7, output: 10, nutrition: 755, avalon: true,
    focusByEnchant: [4640, 6650, 10650, 22660], sauceByEnchant: [0, 90, 90, 90],
    ingredientes: [{ id: "T8_MILK", name: "Leche de vaca", qty: 36 }, { id: "T7_MEAT", name: "Carne de cerdo", qty: 72 }, { id: "T5_EGG", name: "Huevos de ganso", qty: 18 }, { id: "QUESTITEM_TOKEN_AVALON", name: "QUESTITEM_TOKEN_AVALON", qty: 90 }] },
  { id: "T7_MEAL_OMELETTE_FISH", name: "Tortilla de cangrejo de pozo", tipo: "Tortillas", tier: 7, output: 1, nutrition: 1002, avalon: false,
    focusByEnchant: [672, 1272, 2473, 6076], sauceByEnchant: [0, 27, 27, 27],
    ingredientes: [{ id: "T7_FISH_FRESHWATER_STEPPE_RARE", name: "Cangrejo de pozo", qty: 1 }, { id: "T7_CORN", name: "Fardo de ma\u00edz", qty: 6 }, { id: "T7_MULLEIN", name: "Gordolobo de fuego", qty: 6 }, { id: "T7_MEAT", name: "Carne de cerdo", qty: 6 }] },
  { id: "T7_MEAL_PIE", name: "Pastel de cerdo", tipo: "Pasteles", tier: 7, output: 10, nutrition: 799, avalon: false,
    focusByEnchant: [5400, 7390, 11400, 23410], sauceByEnchant: [0, 90, 90, 90],
    ingredientes: [{ id: "T7_CORN", name: "Fardo de ma\u00edz", qty: 18 }, { id: "T3_FLOUR", name: "Harina", qty: 36 }, { id: "T7_MEAT", name: "Carne de cerdo", qty: 72 }, { id: "T6_MILK", name: "Leche de oveja", qty: 18 }] },
  { id: "T7_MEAL_PIE_FISH", name: "Pastel de ojo muerto dos picos", tipo: "Pasteles", tier: 7, output: 1, nutrition: 1002, avalon: false,
    focusByEnchant: [672, 1272, 2473, 6076], sauceByEnchant: [0, 27, 27, 27],
    ingredientes: [{ id: "T7_FISH_FRESHWATER_MOUNTAIN_RARE", name: "Ojo muerto de dos picos", qty: 1 }, { id: "T7_CORN", name: "Fardo de ma\u00edz", qty: 6 }, { id: "T7_MULLEIN", name: "Gordolobo de fuego", qty: 6 }, { id: "T7_MEAT", name: "Carne de cerdo", qty: 6 }] },
  { id: "T7_MEAL_ROAST", name: "Cerdo asado", tipo: "Asados", tier: 7, output: 10, nutrition: 785, avalon: false,
    focusByEnchant: [5280, 7280, 11280, 23290], sauceByEnchant: [0, 90, 90, 90],
    ingredientes: [{ id: "T7_MEAT", name: "Carne de cerdo", qty: 72 }, { id: "T7_CORN", name: "Fardo de ma\u00edz", qty: 36 }, { id: "T8_MILK", name: "Leche de vaca", qty: 36 }] },
  { id: "T7_MEAL_ROAST_FISH", name: "Pargo de niebla pura asado", tipo: "Asados", tier: 7, output: 1, nutrition: 978, avalon: false,
    focusByEnchant: [652, 1253, 2454, 6056], sauceByEnchant: [0, 27, 27, 27],
    ingredientes: [{ id: "T7_FISH_FRESHWATER_AVALON_RARE", name: "Pargo de niebla pura", qty: 1 }, { id: "T7_CORN", name: "Fardo de ma\u00edz", qty: 6 }, { id: "T7_MULLEIN", name: "Gordolobo de fuego", qty: 6 }, { id: "T8_MILK", name: "Leche de vaca", qty: 6 }] },
  { id: "T8_MEAL_SANDWICH", name: "Bocadillo de ternera", tipo: "Bocadillos", tier: 8, output: 10, nutrition: 730, avalon: false,
    focusByEnchant: [4940, 6940, 10940, 22950], sauceByEnchant: [0, 90, 90, 90],
    ingredientes: [{ id: "T4_BREAD", name: "Pan", qty: 36 }, { id: "T8_MEAT", name: "Carne de ternera", qty: 72 }, { id: "T8_BUTTER", name: "Manteca de vaca", qty: 18 }] },
  { id: "T8_MEAL_SANDWICH_AVALON", name: "Bocadillo de ternera avaloniano", tipo: "Bocadillos", tier: 8, output: 10, nutrition: 795, avalon: true,
    focusByEnchant: [4940, 6940, 10940, 22950], sauceByEnchant: [0, 90, 90, 90],
    ingredientes: [{ id: "T4_BREAD", name: "Pan", qty: 36 }, { id: "T8_MEAT", name: "Carne de ternera", qty: 72 }, { id: "T8_BUTTER", name: "Manteca de vaca", qty: 18 }, { id: "QUESTITEM_TOKEN_AVALON", name: "QUESTITEM_TOKEN_AVALON", qty: 90 }] },
  { id: "T8_MEAL_SANDWICH_FISH", name: "Bocadillo de locha de trueno", tipo: "Bocadillos", tier: 8, output: 1, nutrition: 1002, avalon: false,
    focusByEnchant: [672, 1272, 2473, 6076], sauceByEnchant: [0, 27, 27, 27],
    ingredientes: [{ id: "T7_FISH_FRESHWATER_HIGHLANDS_RARE", name: "Locha de trueno", qty: 1 }, { id: "T8_PUMPKIN", name: "Calabaza", qty: 6 }, { id: "T8_YARROW", name: "Milenrama demon\u00edaca", qty: 6 }, { id: "T8_BUTTER", name: "Manteca de vaca", qty: 6 }] },
  { id: "T8_MEAL_STEW", name: "Guiso de ternera", tipo: "Guisos", tier: 8, output: 10, nutrition: 817, avalon: false,
    focusByEnchant: [5510, 7520, 11520, 23530], sauceByEnchant: [0, 90, 90, 90],
    ingredientes: [{ id: "T8_PUMPKIN", name: "Calabaza", qty: 36 }, { id: "T4_BREAD", name: "Pan", qty: 36 }, { id: "T8_MEAT", name: "Carne de ternera", qty: 72 }] },
  { id: "T8_MEAL_STEW_AVALON", name: "Guiso de ternera avaloniano", tipo: "Guisos", tier: 8, output: 10, nutrition: 850, avalon: true,
    focusByEnchant: [5280, 7280, 11280, 23290], sauceByEnchant: [0, 90, 90, 90],
    ingredientes: [{ id: "T7_CORN", name: "Fardo de ma\u00edz", qty: 36 }, { id: "T8_PUMPKIN", name: "Calabaza", qty: 36 }, { id: "T8_MEAT", name: "Carne de ternera", qty: 72 }, { id: "QUESTITEM_TOKEN_AVALON", name: "QUESTITEM_TOKEN_AVALON", qty: 90 }] },
  { id: "T8_MEAL_STEW_FISH", name: "Guiso de anguila de agua podrida", tipo: "Guisos", tier: 8, output: 1, nutrition: 978, avalon: false,
    focusByEnchant: [652, 1253, 2454, 6056], sauceByEnchant: [0, 27, 27, 27],
    ingredientes: [{ id: "T7_FISH_FRESHWATER_FOREST_RARE", name: "Anguila de agua podrida", qty: 1 }, { id: "T8_PUMPKIN", name: "Calabaza", qty: 6 }, { id: "T8_YARROW", name: "Milenrama demon\u00edaca", qty: 6 }, { id: "T8_MILK", name: "Leche de vaca", qty: 6 }] },
]
