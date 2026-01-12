
export enum SyncType {
  ELEMENT = 'element',
  LUNAR = 'lunar',
  SIGN = 'sign'
}

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  LEGENDARY = 'legendary'
}

export enum ItemType {
  TAROT = 'tarot',
  CONSUMABLE = 'consumable',
  UPGRADE = 'upgrade'
}

export interface Mark {
  type: 'lunar' | 'sign';
  name: string;
  icon: string;
}

export interface Curse {
  id: string;
  type: 'ISOLATED' | 'VOLATILE' | 'TEMPORAL';
  state?: any; // For Volatile tracking (current mode)
}

export interface Card {
  id: number;
  name: string;
  effect: string;
  syncValue: number;
  syncType: SyncType;
  syncBonus: number;
  element: 'fire' | 'water' | 'air' | 'earth' | 'spirit';
  imageUrl: string;
  marks?: Mark[];
  effectId?: string;
}

export interface CardInstance {
    instanceId: string;
    cardId: number;
    cooldownUntil?: number;
    curse?: Curse;
    marks: Mark[];
    name?: string; // Added to support custom names like "Vazio"
    
    // Complex State Tracking
    effectMultiplier?: number; // For The Devil
    isBlank?: boolean; // For The Lovers (left behind)
    isConsumed?: boolean; // For single use cards like Fool/Hanged Man
    isSimulated?: boolean; // For The Tower simulation
    
    // State for specific cards
    justiceBonus?: number;
    towerCycles?: number; // For Tower (every 8)
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: ItemType;
  rarity: Rarity;
  cardData?: Card;
}

export interface CycleState {
  daily: number;
  lunar: number;
  sign: number;
  cycleDuration: number;
  dailyComplete: boolean;
  lunarComplete: boolean;
  signComplete: boolean;
}

export interface CircleSlot {
  // FIX: Permite a posição 3 para o quarto slot da sinergia EMPRESS_EMPEROR.
  position: 0 | 1 | 2 | 3;
  card: CardInstance | null;
  syncPercentage: number;
}

export interface GlobalBuff {
    id: string;
    sourceCardId: number;
    modifier: number; // Multiplier value
    duration: number; // in hours of game
    type: 'EFFECT_MULTIPLIER' | 'SYNC_MODIFIER' | 'TICK_SPEED';
}

export interface PendingPayout {
    deliveryTime: number;
    amount: number;
}


// --- Save/Load System Types ---

export interface SavedCardInstance {
  cid: number; // cardId
  iid: string; // instanceId
  m: Mark[];   // marks
  cd?: number; // cooldownUntil
  cr?: Curse;  // curse
  ib?: boolean;// isBlank
  jb?: number; // justiceBonus
  tc?: number; // towerCycles
  em?: number; // effectMultiplier
}

export interface SaveState {
  v: number;      // version
  cur: number;    // currency
  gh: number;     // globalHours
  tr: number;     // tickRate
  psb: number;    // permanentSyncBonus
  inv: SavedCardInstance[]; // inventory
  sl: (SavedCardInstance | null)[]; // slots
  pp: PendingPayout[]; // pendingPayouts
  gb: GlobalBuff[];   // globalBuffs
}

export const KF_C3 = "33L";
export const KF_A2 = "12I";