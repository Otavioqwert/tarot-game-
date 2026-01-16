import { CardInstance, CircleSlot, GlobalBuff, PendingPayout, ShopItem, Card, Mark } from './types';
import { LUNAR_MAX, DAILY_MAX, TICK_RATE, TAROT_LIBRARY, ZODIAC_SIGNS, LUNAR_PHASES } from './constants';
import { ActiveSynergy } from './synergies';

// ============================================================================
// SYSTEM TYPES & HELPERS
// ============================================================================

export interface EffectContext {
  // Card & State
  cardInstance: CardInstance;
  cardIndex: number;
  slots: CircleSlot[];
  globalHours: number;
  currentCycle: number; // 0-23 = day, 0-167 = moon, 0-671 = sign
  globalSync: number;
  activeSynergies: ActiveSynergy[];
  globalBuffs: GlobalBuff[];

  // Setters
  setSlots: React.Dispatch<React.SetStateAction<CircleSlot[]>>;
  setInventory: React.Dispatch<React.SetStateAction<CardInstance[]>>;
  setCurrency: React.Dispatch<React.SetStateAction<number>>;
  setGlobalHours: React.Dispatch<React.SetStateAction<number>>;
  setGlobalBuffs: React.Dispatch<React.SetStateAction<GlobalBuff[]>>;
  setPendingPayouts: React.Dispatch<React.SetStateAction<PendingPayout[]>>;
  setTickRate: React.Dispatch<React.SetStateAction<number>>;
  setSynergyResourceRate: React.Dispatch<React.SetStateAction<number>>;
}

export interface CycleOutput {
  resources: number;
  sync: number;
  timeAdjustment: number;
  selfUpdate?: Partial<CardInstance>;
}

type CardHandler = {
  onActivate?: (ctx: EffectContext) => void;
  onCycle?: (ctx: EffectContext) => CycleOutput;
  onRestock?: (ctx: EffectContext) => void;
};

// ============================================================================
// LAZY HELPERS - Only compute when needed
// ============================================================================

const getCardData = (instance: CardInstance | null | undefined): Card | undefined => {
  if (!instance) return undefined;
  return TAROT_LIBRARY.find(c => c.id === instance.cardId);
};

const getAdjacentCards = (
  slots: CircleSlot[],
  index: number
): { left: CardInstance | null; right: CardInstance | null } => {
  const n = slots.length;
  return {
    left: slots[(index - 1 + n) % n].card || null,
    right: slots[(index + 1) % n].card || null,
  };
};

const countEmptySlots = (slots: CircleSlot[]): number => {
  return slots.filter(s => !s.card).length;
};

const getMoonPhaseIndex = (globalHours: number): number => {
  return Math.floor((globalHours % LUNAR_MAX) / 42); // 0-3 for 4 phases
};

const getDayHour = (globalHours: number): number => {
  return globalHours % DAILY_MAX;
};

const isNightTime = (globalHours: number): boolean => {
  const hour = getDayHour(globalHours);
  return hour < 6 || hour >= 18;
};

const isDayTime = (globalHours: number): boolean => !isNightTime(globalHours);

const isNoon = (globalHours: number): boolean => getDayHour(globalHours) === 12;

const calculateMoonContribution = (mark: Mark, moonModifier: number): number => {
  return mark.type === 'lunar' ? moonModifier : 0.5;
};

const calculateSignContribution = (mark: Mark, signModifier: number): number => {
  return mark.type === 'sign' ? signModifier : 0.5;
};

// ============================================================================
// INDIVIDUAL CARD IMPLEMENTATIONS (0-21)
// ============================================================================

// 0. THE FOOL - Volta 24 ciclos, uso único. Primeiros 12 ciclos +30s duração.
const THE_FOOL: CardHandler = {
  onActivate: (ctx) => {
    // Volta 24 ciclos (1 dia completo)
    ctx.setGlobalHours(h => Math.max(0, h - DAILY_MAX));

    // Primeiros 12 ciclos com +30s duração
    const originalTickRate = TICK_RATE;
    const extendedTickRate = TICK_RATE + 30000;
    ctx.setTickRate(extendedTickRate);

    setTimeout(() => {
      ctx.setTickRate(originalTickRate);
    }, 12 * extendedTickRate);

    // Marca como consumido (uso único)
    const newSlots = [...ctx.slots];
    if (newSlots[ctx.cardIndex].card) {
      newSlots[ctx.cardIndex].card!.isConsumed = true;
      newSlots[ctx.cardIndex].card = null; // Remove carta após uso
    }
    ctx.setSlots(newSlots);
  },
};

// 1. THE MAGICIAN - Dobra efeitos que não abranjam recursos ou ampliações à direita
const THE_MAGICIAN: CardHandler = {
  onCycle: () => {
    // O efeito dele é aplicado como modificador adjacente no processamento final
    // Aqui ele não gera output direto
    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 2. THE HIGH PRIESTESS - Avança 168 ciclos, cooldown de 168 ciclos
// 🔴 HOTFIX: Cooldown era 2*LUNAR_MAX (336h), agora é 1*LUNAR_MAX (168h)
const THE_HIGH_PRIESTESS: CardHandler = {
  onActivate: (ctx) => {
    // Avança 168 ciclos (1 lua completa)
    ctx.setGlobalHours(h => h + LUNAR_MAX);

    // Define cooldown de 168 ciclos (CORRIGIDO: era + LUNAR_MAX + LUNAR_MAX)
    const newSlots = [...ctx.slots];
    if (newSlots[ctx.cardIndex].card) {
      newSlots[ctx.cardIndex].card!.cooldownUntil = ctx.globalHours + LUNAR_MAX;
    }
    ctx.setSlots(newSlots);
  },
};

// 3. THE EMPRESS - Copia efeito e estado da carta à direita, mantendo marcas próprias
const THE_EMPRESS: CardHandler = {
  onCycle: (ctx) => {
    const { right } = getAdjacentCards(ctx.slots, ctx.cardIndex);
    if (!right) return { resources: 0, sync: 0, timeAdjustment: 0 };

    const rightData = getCardData(right);
    if (!rightData) return { resources: 0, sync: 0, timeAdjustment: 0 };

    // Copia o efeito de onCycle da carta à direita se ela tem
    const rightHandler = cardHandlers[rightData.effectId || ''];
    if (rightHandler?.onCycle) {
      const rightCtx = { ...ctx, cardInstance: right, cardIndex: (ctx.cardIndex + 1) % ctx.slots.length };
      const rightOutput = rightHandler.onCycle(rightCtx);
      // Empress mantém seus estados mas copia output
      return rightOutput;
    }

    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 4. THE EMPEROR - Aumenta em torno de 25% efeitos de sinergia
const THE_EMPEROR: CardHandler = {
  onCycle: () => {
    // Bonus é aplicado como multiplicador global durante processamento
    // Aqui não há output direto
    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 5. THE HIEROPHANT - Ganha até 0.3 recursos * Sync²
const THE_HIEROPHANT: CardHandler = {
  onCycle: (ctx) => {
    const syncSquared = Math.pow(ctx.globalSync, 2);
    const resources = 0.3 * syncSquared;
    return { resources, sync: 0, timeAdjustment: 0 };
  },
};

// 6. THE LOVERS - Escolha de 2 cartas, deixa carta em branco herdando marcas
// ✅ Modal já conectado em App.tsx (handleActivateEffect)
const THE_LOVERS: CardHandler = {
  onActivate: (ctx) => {
    // A lógica de escolha está implementada em App.tsx
    // Este handler é chamado por activateCardEffect mas a lógica principal
    // está no handleActivateEffect do App que detecta THE_LOVERS e abre o modal
    const currentMarks = ctx.cardInstance.marks;

    const newSlots = [...ctx.slots];
    newSlots[ctx.cardIndex] = {
      ...newSlots[ctx.cardIndex],
      card: {
        instanceId: `blank-${Date.now()}`,
        cardId: -1, // BLANK_CARD_DATA
        marks: currentMarks,
        isBlank: true,
      },
    };
    ctx.setSlots(newSlots);
  },
};

// 7. THE CHARIOT - Reduz 1 ciclo/dy. 10% chance de reduzir 2 ciclos cooldown
const THE_CHARIOT: CardHandler = {
  onCycle: (ctx) => {
    let timeAdjustment = -1;

    // 10% de chance de reduzir 2 ciclos de cooldown das cartas no círculo
    if (Math.random() < 0.1) {
      const newSlots = [...ctx.slots];
      newSlots.forEach(slot => {
        if (slot.card?.cooldownUntil) {
          slot.card.cooldownUntil = Math.max(ctx.globalHours, slot.card.cooldownUntil - 2);
        }
      });
      ctx.setSlots(newSlots);
    }

    return { resources: 0, sync: 0, timeAdjustment };
  },
};

// 8. STRENGTH - +1 soma numérica para efeito principal de cartas adjacentes
const STRENGTH: CardHandler = {
  onCycle: () => {
    // O efeito dele é aplicado como modificador adjacente
    // Aqui não há output direto
    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 9. THE HERMIT - Ganha 5 recursos por ciclo por espaço vazio
const THE_HERMIT: CardHandler = {
  onCycle: (ctx) => {
    const emptyCount = countEmptySlots(ctx.slots);
    const resources = 5 * emptyCount;
    return { resources, sync: 0, timeAdjustment: 0 };
  },
};

// 10. WHEEL OF FORTUNE - Aumenta efeito em 50% * Sync se marcas ativadas
const WHEEL_OF_FORTUNE: CardHandler = {
  onCycle: (ctx) => {
    const hasActiveMarks = ctx.cardInstance.marks && ctx.cardInstance.marks.length > 0;
    if (!hasActiveMarks) return { resources: 0, sync: 0, timeAdjustment: 0 };
    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 11. JUSTICE - +1% Sync e 25 recursos a cada 7 ciclos, reset a cada 168
const JUSTICE: CardHandler = {
  onCycle: (ctx) => {
    let resources = 0;
    let sync = 0;
    const selfUpdate: Partial<CardInstance> = {};

    const hourInMoon = ctx.globalHours % LUNAR_MAX;

    if (hourInMoon === 0 && ctx.globalHours > 0) {
      selfUpdate.justiceBonus = 0;
    }

    if (hourInMoon % 7 === 0 && hourInMoon > 0) {
      resources = 25;
      sync = 0.01;
      const currentBonus = ctx.cardInstance.justiceBonus || 0;
      selfUpdate.justiceBonus = currentBonus + 1;
    }

    return {
      resources,
      sync,
      timeAdjustment: 0,
      selfUpdate: Object.keys(selfUpdate).length > 0 ? selfUpdate : undefined,
    };
  },
};

// 12. THE HANGED MAN - Consome cartas e retorna ((n+1)*n/2)*50 recursos após 1 lua
// 🔴 HOTFIX: Fórmula corrigida para triangular (estava linear n*50)
const THE_HANGED_MAN: CardHandler = {
  onActivate: (ctx) => {
    const newSlots = [...ctx.slots];
    if (newSlots[ctx.cardIndex].card) {
      newSlots[ctx.cardIndex].card!.hangedManActive = true;
      newSlots[ctx.cardIndex].card!.hangedManConsumes = 0;
    }
    ctx.setSlots(newSlots);
  },
  onCycle: (ctx) => {
    if (!ctx.cardInstance.hangedManActive) return { resources: 0, sync: 0, timeAdjustment: 0 };

    const hoursSinceActive = ctx.globalHours - (ctx.cardInstance.hangedManActivatedAt || ctx.globalHours);

    if (hoursSinceActive >= LUNAR_MAX) {
      const consumedCount = ctx.cardInstance.hangedManConsumes || 0;
      // 🔴 CORRIGIDO: Fórmula triangular (n*(n+1)/2)*50
      const resources = 50 * consumedCount * (consumedCount + 1) / 2;

      const selfUpdate: Partial<CardInstance> = {
        hangedManActive: false,
        hangedManConsumes: 0,
        hangedManActivatedAt: undefined,
      };

      return { resources, sync: 0, timeAdjustment: 0, selfUpdate };
    }

    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 13. DEATH - Na próxima lua, consome carta à esquerda e transforma outra em Death
const DEATH: CardHandler = {
  onCycle: (ctx) => {
    const hourInMoon = ctx.globalHours % LUNAR_MAX;
    const isNewMoon = hourInMoon === 0 && ctx.globalHours > 0;

    if (!isNewMoon) return { resources: 0, sync: 0, timeAdjustment: 0 };

    const newSlots = [...ctx.slots];
    const leftIdx = (ctx.cardIndex - 1 + ctx.slots.length) % ctx.slots.length;
    const leftCard = newSlots[leftIdx].card;

    // Sinergia DEATH_TOWER: não consumir Tower
    const hasDeathTower = ctx.activeSynergies.some(s => s.id === 'DEATH_TOWER');
    const leftEffectId = leftCard ? getCardData(leftCard)?.effectId : null;
    if (hasDeathTower && leftEffectId === 'THE_TOWER') {
      ctx.setSlots(newSlots);
      return { resources: 0, sync: 0, timeAdjustment: 0 };
    }

    if (leftCard) {
      const inheritedMarks = leftCard.marks;

      newSlots[leftIdx].card = null;

      const otherIndices = ctx.slots
        .map((_, i) => i)
        .filter(i => i !== ctx.cardIndex && i !== leftIdx && newSlots[i].card);

      if (otherIndices.length > 0) {
        const targetIdx = otherIndices[Math.floor(Math.random() * otherIndices.length)];
        newSlots[targetIdx].card = {
          instanceId: `death-${Date.now()}-${Math.random()}`,
          cardId: 13,
          marks: inheritedMarks,
        };
      }

      ctx.setSlots(newSlots);
    }

    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 14. TEMPERANCE - Converte numerais para 2 dígitos e equaliza em pares
const TEMPERANCE: CardHandler = {
  onCycle: () => {
    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 15. THE DEVIL - Consome marcas, concede recompensas e maldições
const THE_DEVIL: CardHandler = {
  onActivate: (ctx) => {
    const newSlots = [...ctx.slots];
    let consumed = 0;

    for (let i = 0; i < ctx.slots.length && consumed < 2; i++) {
      if (i === ctx.cardIndex || !newSlots[i].card || newSlots[i].card!.marks.length === 0) {
        continue;
      }

      newSlots[i].card!.marks.pop();
      consumed++;

      const curseTypes = ['ISOLATED', 'VOLATILE', 'TEMPORAL'] as const;
      const curseType = curseTypes[Math.floor(Math.random() * curseTypes.length)];
      newSlots[i].card!.curse = {
        id: `curse-${Date.now()}-${i}`,
        type: curseType,
      };

      const chanceDouble = Math.random() < 0.5;
      const rewardCount = chanceDouble ? 2 : 1;

      for (let r = 0; r < rewardCount; r++) {
        const rewardType = Math.random();
        if (rewardType < 0.33) {
          ctx.setCurrency(c => c + 250);
        } else if (rewardType < 0.66) {
          // TODO: sync permanente - implementar setPermanentSyncBonus
        } else {
          if (newSlots[ctx.cardIndex].card) {
            newSlots[ctx.cardIndex].card!.effectMultiplier =
              (newSlots[ctx.cardIndex].card!.effectMultiplier || 1) + 1;
          }
        }
      }
    }

    ctx.setSlots(newSlots);
    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 16. THE TOWER - Reorganiza a cada 8 ciclos, chance de Arcano Maior
const THE_TOWER: CardHandler = {
  onCycle: (ctx) => {
    let resources = 0;
    let sync = 0;
    const selfUpdate: Partial<CardInstance> = {};

    const hourInTowerCycle = ctx.globalHours % 8;
    const isReorganizeTime = hourInTowerCycle === 0 && ctx.globalHours > 0;

    const hasDeathTower = ctx.activeSynergies.some(s => s.id === 'DEATH_TOWER');
    const deathTower = ctx.activeSynergies.find(s => s.id === 'DEATH_TOWER');

    if (isReorganizeTime) {
      const newSlots = [...ctx.slots];

      for (let i = newSlots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newSlots[i].card, newSlots[j].card] = [newSlots[j].card, newSlots[i].card];
      }

      let arcanoMajorChance = 0.15;
      if (hasDeathTower) {
        arcanoMajorChance = deathTower?.isEmpowered ? 0.625 : 0.5;
      }

      if (Math.random() < arcanoMajorChance) {
        selfUpdate.towerArcanoActive = true;
        selfUpdate.towerArcanoCycles = 8;
      }

      ctx.setSlots(newSlots);
    }

    if (ctx.cardInstance.towerArcanoActive && (ctx.cardInstance.towerArcanoCycles || 0) > 0) {
      ctx.slots.forEach((slot, idx) => {
        if (!slot.card || getCardData(slot.card)?.effectId === 'THE_TOWER') return;

        const cardHandler = cardHandlers[getCardData(slot.card)?.effectId || ''];
        if (cardHandler?.onCycle) {
          const slotCtx = { ...ctx, cardInstance: slot.card, cardIndex: idx };
          const slotOutput = cardHandler.onCycle(slotCtx);
          resources += slotOutput.resources;
          sync += slotOutput.sync;
        }
      });

      selfUpdate.towerArcanoCycles = (ctx.cardInstance.towerArcanoCycles || 0) - 1;
      if (selfUpdate.towerArcanoCycles <= 0) {
        selfUpdate.towerArcanoActive = false;
      }
    }

    return {
      resources,
      sync,
      timeAdjustment: 0,
      selfUpdate: Object.keys(selfUpdate).length > 0 ? selfUpdate : undefined,
    };
  },
};

// 17. THE STAR - +20% Sync base, +30% por marca, penaliza desvios
const THE_STAR: CardHandler = {
  onCycle: (ctx) => {
    let sync = 0.2;

    const cardMarks = ctx.cardInstance.marks || [];
    if (cardMarks.length === 0) return { resources: 0, sync, timeAdjustment: 0 };

    const markPatterns = new Map<string, number>();
    ctx.slots.forEach(slot => {
      if (!slot.card) return;
      const marks = slot.card.marks;
      if (marks.length > 0) {
        const pattern = marks.map(m => `${m.type}:${m.name}`).join('|');
        markPatterns.set(pattern, (markPatterns.get(pattern) || 0) + 1);
      }
    });

    const dominantPattern = Array.from(markPatterns.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

    const currentPattern = cardMarks.map(m => `${m.type}:${m.name}`).join('|');
    const matchesDominant = currentPattern === dominantPattern;

    if (matchesDominant) {
      sync += 0.3 * cardMarks.length;
    } else {
      const differentMarkCount = cardMarks.length;
      const divisor = differentMarkCount >= 2 ? 3 : 2;
      sync += (0.3 * cardMarks.length) / divisor;
    }

    return { resources: 0, sync, timeAdjustment: 0 };
  },
};

// 18. THE MOON - Lua 100%, Signo 30%, Reduz efeitos diretos de Sync em 40%
const THE_MOON: CardHandler = {
  onCycle: () => {
    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 19. THE SUN - Dias (6-12) ativa marcas de lua, ciclo 12 multiplica efeitos por 4
const THE_SUN: CardHandler = {
  onCycle: (ctx) => {
    const hour = getDayHour(ctx.globalHours);
    const lunarActive = hour >= 6 && hour <= 12;

    if (lunarActive && isNoon(ctx.globalHours)) {
      return { resources: 0, sync: 0, timeAdjustment: 0 };
    }

    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 20. JUDGEMENT - Replica 50% dos efeitos adjacentes, reduz alvos em 25%
const JUDGEMENT: CardHandler = {
  onCycle: () => {
    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// 21. THE WORLD - Cooldown 2 luas, buffs globais
const THE_WORLD: CardHandler = {
  onActivate: (ctx) => {
    ctx.setCurrency(c => c + 999);

    const newSlots = [...ctx.slots];
    if (newSlots[ctx.cardIndex].card) {
      newSlots[ctx.cardIndex].card!.cooldownUntil = ctx.globalHours + 2 * LUNAR_MAX;
    }

    ctx.setGlobalBuffs(buffs => [
      ...buffs,
      {
        id: `world-effect-${Date.now()}`,
        sourceCardId: 21,
        duration: 24,
        modifier: 2,
        type: 'EFFECT_MULTIPLIER',
      },
      {
        id: `world-sync-${Date.now()}`,
        sourceCardId: 21,
        duration: 12,
        modifier: 4,
        type: 'SYNC_MODIFIER',
      },
    ]);

    ctx.setSlots(newSlots);
  },
};

// BLANK CARD - Herda marcas e não faz nada por si
const BLANK: CardHandler = {
  onCycle: () => {
    return { resources: 0, sync: 0, timeAdjustment: 0 };
  },
};

// ============================================================================
// CARD HANDLER REGISTRY
// ============================================================================

export const cardHandlers: Record<string, CardHandler> = {
  THE_FOOL,
  THE_MAGICIAN,
  THE_HIGH_PRIESTESS,
  THE_EMPRESS,
  THE_EMPEROR,
  THE_HIEROPHANT,
  THE_LOVERS,
  THE_CHARIOT,
  STRENGTH,
  THE_HERMIT,
  WHEEL_OF_FORTUNE,
  JUSTICE,
  THE_HANGED_MAN,
  DEATH,
  TEMPERANCE,
  THE_DEVIL,
  THE_TOWER,
  THE_STAR,
  THE_MOON,
  THE_SUN,
  JUDGEMENT,
  THE_WORLD,
  BLANK,
};

// ============================================================================
// GLOBAL CYCLE PROCESSOR - Lazily apply modifiers & aggregate outputs
// ============================================================================

export interface CycleProcessResult {
  totalResources: number;
  totalSync: number;
  slotUpdates: Record<number, Partial<CardInstance>>;
  timeAdjustment: number;
}

export const processCycle = (
  slots: CircleSlot[],
  globalHours: number,
  globalSync: number,
  globalBuffs: GlobalBuff[],
  activeSynergies: ActiveSynergy[],
  setSlots: React.Dispatch<React.SetStateAction<CircleSlot[]>>,
  setInventory: React.Dispatch<React.SetStateAction<CardInstance[]>>,
  setCurrency: React.Dispatch<React.SetStateAction<number>>,
  setGlobalHours: React.Dispatch<React.SetStateAction<number>>,
  setGlobalBuffs: React.Dispatch<React.SetStateAction<GlobalBuff[]>>,
  setPendingPayouts: React.Dispatch<React.SetStateAction<PendingPayout[]>>,
  setTickRate: React.Dispatch<React.SetStateAction<number>>,
  setSynergyResourceRate: React.Dispatch<React.SetStateAction<number>>
): CycleProcessResult => {
  const slotUpdates: Record<number, Partial<CardInstance>> = {};
  let totalResources = 0;
  let totalSync = 0;
  let timeAdjustment = 0;

  const hour = getDayHour(globalHours);
  const hourInMoon = globalHours % LUNAR_MAX;
  const isSun = slots.some(s => getCardData(s.card)?.effectId === 'THE_SUN');
  const atNoon = hour === 12;
  const hasTemperance = slots.some(s => getCardData(s.card)?.effectId === 'TEMPERANCE');
  const hasWheel = slots.some(s => getCardData(s.card)?.effectId === 'WHEEL_OF_FORTUNE');
  const hasEmperor = slots.some(s => getCardData(s.card)?.effectId === 'THE_EMPEROR');

  const hasFoolWorld = activeSynergies.some(s => s.id === 'FOOL_WORLD');
  const foolWorld = activeSynergies.find(s => s.id === 'FOOL_WORLD');
  const hasHierophantHermit = activeSynergies.some(s => s.id === 'HIEROPHANT_HERMIT');
  const hieroHermit = activeSynergies.find(s => s.id === 'HIEROPHANT_HERMIT');
  const hasMagicianPriestess = activeSynergies.some(s => s.id === 'MAGICIAN_PRIESTESS');
  const magicianPriestess = activeSynergies.find(s => s.id === 'MAGICIAN_PRIESTESS');
  const hasWheelJudgement = activeSynergies.some(s => s.id === 'WHEEL_JUDGEMENT');

  // Step 1: Collect raw outputs from each card
  const rawOutputs: Record<number, CycleOutput> = {};

  slots.forEach((slot, idx) => {
    if (!slot.card) {
      rawOutputs[idx] = { resources: 0, sync: 0, timeAdjustment: 0 };
      return;
    }

    const cardData = getCardData(slot.card);
    const handler = cardHandlers[cardData?.effectId || ''];

    if (handler?.onCycle) {
      const cycleCtx: EffectContext = {
        cardInstance: slot.card,
        cardIndex: idx,
        slots,
        globalHours,
        currentCycle: hourInMoon,
        globalSync,
        activeSynergies,
        globalBuffs,
        setSlots,
        setInventory,
        setCurrency,
        setGlobalHours,
        setGlobalBuffs,
        setPendingPayouts,
        setTickRate,
        setSynergyResourceRate,
      };

      const output = handler.onCycle(cycleCtx);

      if (
        hasHierophantHermit &&
        (cardData?.effectId === 'THE_HIEROPHANT' || cardData?.effectId === 'THE_HERMIT')
      ) {
        rawOutputs[idx] = { resources: 0, sync: 0, timeAdjustment: 0 };
      } else {
        rawOutputs[idx] = output;
        if (output.selfUpdate) {
          slotUpdates[idx] = output.selfUpdate;
        }
      }
    } else {
      rawOutputs[idx] = { resources: 0, sync: 0, timeAdjustment: 0 };
    }
  });

  // MAGician + Priestess: extra ciclo para passivos puros
  if (hasMagicianPriestess) {
    slots.forEach((slot, idx) => {
      if (!slot.card) return;
      const cardData = getCardData(slot.card);
      if (!cardData?.effectId) return;
      const handler = cardHandlers[cardData.effectId];
      const isPurePassive = !!handler?.onCycle && !handler?.onActivate;
      if (!isPurePassive) return;

      const extraCtx: EffectContext = {
        cardInstance: slot.card,
        cardIndex: idx,
        slots,
        globalHours,
        currentCycle: hourInMoon,
        globalSync,
        activeSynergies,
        globalBuffs,
        setSlots,
        setInventory,
        setCurrency,
        setGlobalHours,
        setGlobalBuffs,
        setPendingPayouts,
        setTickRate,
        setSynergyResourceRate,
      };

      const extra = handler.onCycle!(extraCtx);
      const scale = magicianPriestess?.isEmpowered ? 1.3 : 1;

      rawOutputs[idx].resources += extra.resources * scale;
      rawOutputs[idx].sync += extra.sync * scale;
      timeAdjustment += extra.timeAdjustment * scale;

      if (extra.selfUpdate) {
        slotUpdates[idx] = {
          ...(slotUpdates[idx] || {}),
          ...extra.selfUpdate,
        };
      }
    });
  }

  // Step 2: Apply adjacency modifiers
  const modifiedOutputs: Record<number, CycleOutput> = JSON.parse(JSON.stringify(rawOutputs));

  slots.forEach((slot, idx) => {
    if (!slot.card) return;

    const cardData = getCardData(slot.card);
    const effect = cardData?.effectId;
    const { left, right } = getAdjacentCards(slots, idx);

    if (effect === 'THE_MAGICIAN' && right) {
      const rightIdx = (idx + 1) % slots.length;
      modifiedOutputs[rightIdx].resources *= 2;
      modifiedOutputs[rightIdx].sync *= 2;
    }

    if (effect === 'STRENGTH') {
      const leftIdx = (idx - 1 + slots.length) % slots.length;
      const rightIdx = (idx + 1) % slots.length;
      modifiedOutputs[leftIdx].resources += 1;
      modifiedOutputs[rightIdx].resources += 1;
    }

    if (effect === 'JUDGEMENT') {
      const leftIdx = (idx - 1 + slots.length) % slots.length;
      const rightIdx = (idx + 1) % slots.length;

      modifiedOutputs[idx].resources += rawOutputs[leftIdx].resources * 0.5;
      modifiedOutputs[idx].resources += rawOutputs[rightIdx].resources * 0.5;
      modifiedOutputs[idx].sync += rawOutputs[leftIdx].sync * 0.5;
      modifiedOutputs[idx].sync += rawOutputs[rightIdx].sync * 0.5;

      if (!hasWheelJudgement) {
        modifiedOutputs[leftIdx].resources *= 0.75;
        modifiedOutputs[rightIdx].resources *= 0.75;
        modifiedOutputs[leftIdx].sync *= 0.75;
        modifiedOutputs[rightIdx].sync *= 0.75;
      }
    }
  });

  // Step 3: Apply global modifiers (Sun, Buffs, Emperor)
  Object.entries(modifiedOutputs).forEach(([idxStr, output]) => {
    const idx = parseInt(idxStr, 10);

    if (isSun && atNoon) {
      output.resources *= 4;
      output.sync *= 4;
    }

    if (slots[idx]?.card?.effectMultiplier) {
      output.resources *= slots[idx].card!.effectMultiplier!;
      output.sync *= slots[idx].card!.effectMultiplier!;
    }

    globalBuffs.forEach(buff => {
      if (buff.type === 'EFFECT_MULTIPLIER') {
        output.resources *= buff.modifier;
      } else if (buff.type === 'SYNC_MODIFIER') {
        output.sync *= buff.modifier;
      }
    });

    if (hasEmperor) {
      output.resources *= 1.25;
      output.sync *= 1.25;
    }
  });

  // Step 4: Temperance equalization
  if (hasTemperance) {
    const resourceValues = Object.entries(modifiedOutputs)
      .filter(([_, out]) => out.resources > 0)
      .map(([idx, out]) => ({ idx: parseInt(idx, 10), value: out.resources }));

    if (resourceValues.length > 1) {
      const avg = resourceValues.reduce((acc, item) => acc + item.value, 0) / resourceValues.length;
      resourceValues.forEach(item => {
        modifiedOutputs[item.idx].resources = avg;
      });
    }

    const syncValues = Object.entries(modifiedOutputs)
      .filter(([_, out]) => out.sync > 0)
      .map(([idx, out]) => ({ idx: parseInt(idx, 10), value: out.sync }));

    if (syncValues.length > 1) {
      const avg = syncValues.reduce((acc, item) => acc + item.value, 0) / syncValues.length;
      syncValues.forEach(item => {
        modifiedOutputs[item.idx].sync = avg;
      });
    }
  }

  // Step 5: Aggregate
  Object.values(modifiedOutputs).forEach(output => {
    totalResources += output.resources;
    totalSync += output.sync;
    timeAdjustment += output.timeAdjustment;
  });

  // FOOL_WORLD: buff percentual de recursos nos ciclos 6–18
  if (hasFoolWorld) {
    if (hour >= 6 && hour < 18) {
      const bonus = foolWorld?.isEmpowered ? 0.0375 : 0.03;
      totalResources *= 1 + bonus;
    }
  }

  // Hermit + Hierophant: fonte fixa de recursos/s via synergyResourceRate
  if (hasHierophantHermit) {
    const basePerSecond = hieroHermit?.isEmpowered ? 0.625 : 0.5;
    setSynergyResourceRate(basePerSecond * 30); // 30 => converter para sistema existente
  } else {
    setSynergyResourceRate(0);
  }

  // Wheel of Fortune bonus global (mantido)
  if (hasWheel) {
    slots.forEach(slot => {
      if (slot.card?.marks && slot.card.marks.length > 0) {
        totalResources *= 1 + 0.5 * globalSync;
      }
    });
  }

  return { totalResources, totalSync, slotUpdates, timeAdjustment };
};

// ============================================================================
// ACTIVATION & RESTOCK HANDLERS
// ============================================================================

export const activateCardEffect = (
  cardIndex: number,
  slots: CircleSlot[],
  globalHours: number,
  globalSync: number,
  activeSynergies: ActiveSynergy[],
  globalBuffs: GlobalBuff[],
  setSlots: React.Dispatch<React.SetStateAction<CircleSlot[]>>,
  setInventory: React.Dispatch<React.SetStateAction<CardInstance[]>>,
  setCurrency: React.Dispatch<React.SetStateAction<number>>,
  setGlobalHours: React.Dispatch<React.SetStateAction<number>>,
  setGlobalBuffs: React.Dispatch<React.SetStateAction<GlobalBuff[]>>,
  setPendingPayouts: React.Dispatch<React.SetStateAction<PendingPayout[]>>,
  setTickRate: React.Dispatch<React.SetStateAction<number>>,
  setSynergyResourceRate: React.Dispatch<React.SetStateAction<number>>
) => {
  const card = slots[cardIndex]?.card;
  if (!card) return;

  const cardData = getCardData(card);
  const handler = cardHandlers[cardData?.effectId || ''];

  if (handler?.onActivate) {
    const ctx: EffectContext = {
      cardInstance: card,
      cardIndex,
      slots,
      globalHours,
      currentCycle: globalHours % LUNAR_MAX,
      globalSync,
      activeSynergies,
      globalBuffs,
      setSlots,
      setInventory,
      setCurrency,
      setGlobalHours,
      setGlobalBuffs,
      setPendingPayouts,
      setTickRate,
      setSynergyResourceRate,
    };

    handler.onActivate(ctx);
  }
};

// ============================================================================
// SHOP RESTOCK HANDLER
// ============================================================================

interface RestockContext {
  globalHours: number;
  globalSync: number;
  slots: CircleSlot[];
  activeSynergies: ActiveSynergy[];
  setSlots: React.Dispatch<React.SetStateAction<CircleSlot[]>>;
  setInventory: React.Dispatch<React.SetStateAction<CardInstance[]>>;
  setCurrency: React.Dispatch<React.SetStateAction<number>>;
  setGlobalHours: React.Dispatch<React.SetStateAction<number>>;
  setGlobalBuffs: React.Dispatch<React.SetStateAction<GlobalBuff[]>>;
  setPendingPayouts: React.Dispatch<React.SetStateAction<PendingPayout[]>>;
  setTickRate: React.Dispatch<React.SetStateAction<number>>;
  setSynergyResourceRate: React.Dispatch<React.SetStateAction<number>>;
}

export const handleRestock = (
  items: ShopItem[],
  slots: CircleSlot[],
  context: RestockContext
): ShopItem[] => {
  let modifiedItems = [...items];

  slots.forEach((slot, idx) => {
    if (!slot.card) return;

    const cardData = getCardData(slot.card);
    const handler = cardHandlers[cardData?.effectId || ''];

    if (handler?.onRestock) {
      const restockCtx: EffectContext = {
        cardInstance: slot.card,
        cardIndex: idx,
        slots,
        globalHours: context.globalHours,
        currentCycle: context.globalHours % LUNAR_MAX,
        globalSync: context.globalSync,
        activeSynergies: context.activeSynergies,
        globalBuffs: [],
        setSlots: context.setSlots,
        setInventory: context.setInventory,
        setCurrency: context.setCurrency,
        setGlobalHours: context.setGlobalHours,
        setGlobalBuffs: context.setGlobalBuffs,
        setPendingPayouts: context.setPendingPayouts,
        setTickRate: context.setTickRate,
        setSynergyResourceRate: context.setSynergyResourceRate,
      };

      handler.onRestock(restockCtx);
    }
  });

  return modifiedItems;
};

// ============================================================================
// CRYPTOGRAPHY KEYS (Isolated from save logic)
// ============================================================================

export const KF_B2 = "22L";
export const KF_C6 = "36I";
