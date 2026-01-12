
import { CardInstance, CircleSlot, GlobalBuff, PendingPayout, ShopItem, Card } from './types';
import { LUNAR_MAX, DAILY_MAX, TICK_RATE, TAROT_LIBRARY, ZODIAC_SIGNS, LUNAR_PHASES } from './constants';
import { ActiveSynergy } from './synergies';

// --- System Types ---

export interface EffectArgs {
  cardInstance: CardInstance;
  slots: CircleSlot[];
  slotIndex: number;
  globalHours: number;
  globalSync: number;
  activeSynergies: ActiveSynergy[];
  
  // State Setters
  setSlots: React.Dispatch<React.SetStateAction<CircleSlot[]>>;
  setInventory: React.Dispatch<React.SetStateAction<CardInstance[]>>;
  setCurrency: React.Dispatch<React.SetStateAction<number>>;
  setGlobalHours: React.Dispatch<React.SetStateAction<number>>;
  setGlobalBuffs: React.Dispatch<React.SetStateAction<GlobalBuff[]>>;
  setPendingPayouts: React.Dispatch<React.SetStateAction<PendingPayout[]>>;
  setTickRate: React.Dispatch<React.SetStateAction<number>>;
  setSynergyResourceRate: React.Dispatch<React.SetStateAction<number>>;
  setShopItems?: React.Dispatch<React.SetStateAction<ShopItem[]>>;
  shopItems?: ShopItem[];
}

interface OnCycleResult {
  outputs: Record<string, number>; // e.g. { resources: 5, timeAdjustment: 1 }
  selfUpdate?: Partial<CardInstance>;
}

type EffectFunction = (args: EffectArgs) => void;
type CycleEffectFunction = (args: EffectArgs & { leftCard?: CardInstance | null, rightCard?: CardInstance | null }) => OnCycleResult;

interface CardDefinition {
  onActivate?: EffectFunction;
  onCycle?: CycleEffectFunction;
  onRestock?: EffectFunction;
}

// --- Helpers ---

const getCardData = (instance?: CardInstance | null): Card | undefined => 
    instance ? TAROT_LIBRARY.find(c => c.id === instance.cardId) : undefined;

// --- Card Implementations ---

export const effects: Record<string, CardDefinition> = {
  THE_FOOL: {
    onActivate: (args) => {
      args.setGlobalHours(h => Math.max(0, h - DAILY_MAX));
      const newRate = TICK_RATE + 30000; 
      args.setTickRate(newRate);
      setTimeout(() => args.setTickRate(TICK_RATE), 12 * newRate);
      const newSlots = [...args.slots];
      newSlots[args.slotIndex] = { ...newSlots[args.slotIndex], card: null };
      args.setSlots(newSlots);
    }
  },

  THE_MAGICIAN: {
     onCycle: () => ({ outputs: {} }),
  },

  THE_HIGH_PRIESTESS: {
    onActivate: (args) => {
      args.setGlobalHours(h => h + LUNAR_MAX);
      const newSlots = [...args.slots];
      if (newSlots[args.slotIndex].card) {
        newSlots[args.slotIndex].card!.cooldownUntil = args.globalHours + LUNAR_MAX + LUNAR_MAX;
      }
      args.setSlots(newSlots);
    }
  },

  THE_EMPRESS: {
      onCycle: () => ({ outputs: {} }),
  },

  THE_HIEROPHANT: {
    onCycle: ({ globalSync }) => ({ outputs: { resources: 0.3 * Math.pow(globalSync, 2) } })
  },

  THE_LOVERS: {
      onActivate: () => {},
  },
  
  THE_CHARIOT: {
    onCycle: (args) => {
        const outputs: Record<string, number> = {};
        if (args.globalHours > 0 && args.globalHours % DAILY_MAX === (DAILY_MAX - 1)) {
            outputs.timeAdjustment = 1;
        }
        if (Math.random() < 0.10) {
            const newSlots = [...args.slots];
            newSlots.forEach(s => {
                if (s.card && s.card.cooldownUntil) {
                    s.card.cooldownUntil = Math.max(args.globalHours, s.card.cooldownUntil - 2);
                }
            });
            args.setSlots(newSlots);
        }
        return { outputs };
    }
  },
  
  JUSTICE: {
    onCycle: ({ cardInstance, globalHours }) => {
        const outputs: Record<string, number> = {};
        let selfUpdate: Partial<CardInstance> = {};
        const currentBonus = cardInstance.justiceBonus || 0;

        if (globalHours > 0 && globalHours % 168 === 0) {
            selfUpdate.justiceBonus = 0;
        } else if (globalHours > 0 && globalHours % 7 === 0) {
            outputs.resources = 25;
            selfUpdate.justiceBonus = currentBonus + 1;
        }

        return { outputs, selfUpdate: Object.keys(selfUpdate).length > 0 ? selfUpdate : undefined };
    }
  },

  THE_HERMIT: {
      onCycle: ({ slots }) => ({ outputs: { resources: 2.5 * slots.filter(s => !s.card).length } })
  },

  THE_HANGED_MAN: {
      onActivate: () => {}
  },

  DEATH: {
      onCycle: (args) => {
          const isNewMoon = (args.globalHours % LUNAR_MAX) === 0 && args.globalHours > 0;
          const deathTowerSynergy = args.activeSynergies.some(s => s.id === 'DEATH_TOWER');
          
          if (isNewMoon) {
              const newSlots = [...args.slots];
              const leftIdx = (args.slotIndex + args.slots.length - 1) % args.slots.length;
              const leftCard = newSlots[leftIdx].card;
              const leftCardData = getCardData(leftCard);
              
              if (leftCard && !(deathTowerSynergy && leftCardData?.effectId === 'THE_TOWER')) {
                  const inheritedMarks = leftCard.marks;
                  newSlots[leftIdx].card = null;
                  const otherIndices = args.slots.map((_, i) => i).filter(i => i !== args.slotIndex && i !== leftIdx && newSlots[i].card);
                  if (otherIndices.length > 0) {
                      const targetIdx = otherIndices[Math.floor(Math.random() * otherIndices.length)];
                      newSlots[targetIdx].card = {
                          instanceId: `${Date.now()}-${Math.random()}`,
                          cardId: 13,
                          marks: inheritedMarks,
                      };
                  }
                  args.setSlots(newSlots);
              }
          }
          return { outputs: {} };
      }
  },
  
  TEMPERANCE: {
      onCycle: () => ({ outputs: {} }),
  },

  THE_DEVIL: {
      onActivate: (args) => {
          const newSlots = [...args.slots];
          let consumed = 0;
          args.slots.map((_, i) => i).forEach(idx => {
              if (idx === args.slotIndex || consumed >= 2 || !newSlots[idx].card) return;
              if (newSlots[idx].card!.marks.length > 0) {
                  newSlots[idx].card!.marks.pop();
                  consumed++;
                  const curseType = Math.random() < 0.33 ? 'ISOLATED' : Math.random() < 0.5 ? 'VOLATILE' : 'TEMPORAL';
                  newSlots[idx].card!.curse = { id: `curse-${Date.now()}`, type: curseType };
              }
          });

          for (let i = 0; i < consumed; i++) {
              const rewardRoll = Math.random();
              if (rewardRoll < 0.33) args.setCurrency(c => c + 250);
              else {
                  if (newSlots[args.slotIndex].card) {
                      newSlots[args.slotIndex].card!.effectMultiplier = (newSlots[args.slotIndex].card!.effectMultiplier || 1) + 1;
                  }
              }
          }
          args.setSlots(newSlots);
      }
  },

  THE_TOWER: {
      onCycle: (args) => {
          const outputs: Record<string, number> = {};
          let selfUpdate: Partial<CardInstance> = {};

          if (args.globalHours > 0 && args.globalHours % 8 === 0) {
             const newSlots = [...args.slots];
             for (let i = newSlots.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newSlots[i].card, newSlots[j].card] = [newSlots[j].card, newSlots[i].card];
             }
             
             const synergy = args.activeSynergies.find(s => s.id === 'DEATH_TOWER');
             const activationChance = synergy ? (synergy.isEmpowered ? 0.625 : 0.50) : 0.15;

             if (Math.random() < activationChance && newSlots.find(s => getCardData(s.card)?.effectId === 'THE_TOWER')) {
                const towerSlot = newSlots.find(s => getCardData(s.card)?.effectId === 'THE_TOWER')!;
                if(towerSlot.card) {
                    towerSlot.card.isSimulated = true;
                    towerSlot.card.towerCycles = 8;
                }
             }
             args.setSlots(newSlots);
          }
          
          if (args.cardInstance.isSimulated && (args.cardInstance.towerCycles || 0) > 0) {
              args.slots.forEach((s, idx) => {
                  if (getCardData(s.card)?.effectId !== 'THE_TOWER' && s.card) {
                      const behavior = effects[getCardData(s.card)?.effectId || ''];
                      if (behavior?.onCycle) {
                          const result = behavior.onCycle({ ...args, cardInstance: s.card, slotIndex: idx });
                          for (const key in result.outputs) {
                              outputs[key] = (outputs[key] || 0) + result.outputs[key];
                          }
                      }
                  }
              });
              
              selfUpdate.towerCycles = args.cardInstance.towerCycles! - 1;
              if (selfUpdate.towerCycles <= 0) {
                selfUpdate.isSimulated = false;
              }
          }

          return { outputs, selfUpdate: Object.keys(selfUpdate).length > 0 ? selfUpdate : undefined };
      }
  },

  THE_SUN: {
      onCycle: () => ({ outputs: {} })
  },

  JUDGEMENT: {
      onCycle: () => ({ outputs: {} })
  },

  THE_WORLD: {
      onActivate: (args) => {
           args.setCurrency(c => c + 999);
           args.setGlobalBuffs(b => [ ...b, 
               { id: `w1-${Date.now()}`, sourceCardId: 21, duration: 24, modifier: 2, type: 'EFFECT_MULTIPLIER' },
               { id: `w2-${Date.now()}`, sourceCardId: 21, duration: 12, modifier: 3, type: 'SYNC_MODIFIER' }
           ]);
           const newSlots = [...args.slots];
           if (newSlots[args.slotIndex].card) {
               newSlots[args.slotIndex].card!.cooldownUntil = args.globalHours + (2 * LUNAR_MAX);
           }
           args.setSlots(newSlots);
      }
  },
  BLANK: {
      onCycle: () => ({ outputs: {} })
  }
};

// --- Main Cycle Processor ---

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
): { totalResources: number, slotUpdates: Record<number, Partial<CardInstance>>, timeAdjustment: number } => {
    
    const isMidDay = (globalHours % 24) === 12;
    const slotUpdates: Record<number, Partial<CardInstance>> = {};

    // Synergy Overrides & Setup
    const hieroHermitSynergy = activeSynergies.find(s => s.id === 'HIEROPHANT_HERMIT');
    if (hieroHermitSynergy) {
        setSynergyResourceRate(hieroHermitSynergy.isEmpowered ? 0.625 * 30 : 0.5 * 30);
    } else {
        setSynergyResourceRate(0);
    }

    const effectiveSlots = slots.map((slot, i) => {
        if (slot.card && getCardData(slot.card)?.effectId === 'THE_EMPRESS') {
            const rightIdx = (i + 1) % slots.length;
            const rightCardInstance = slots[rightIdx].card;
            if (rightCardInstance) {
                return { ...slot, card: { ...rightCardInstance, marks: slot.card.marks } };
            }
        }
        return slot;
    });

    const buildArgs = (index: number): EffectArgs => ({
        cardInstance: effectiveSlots[index].card!, slots: effectiveSlots, slotIndex: index, 
        globalHours, globalSync, activeSynergies,
        setSlots, setInventory, setCurrency, setGlobalHours, setGlobalBuffs, setPendingPayouts, setTickRate, setSynergyResourceRate
    });

    // 1. Calculate Raw Outputs & State Updates
    const cycleResults: OnCycleResult[] = effectiveSlots.map((slot, i) => {
        if (!slot.card) return { outputs: {} };
        const cardData = getCardData(slot.card);
        if (hieroHermitSynergy && (cardData?.effectId === 'THE_HIEROPHANT' || cardData?.effectId === 'THE_HERMIT')) {
            return { outputs: {} }; // Nullify effect due to synergy
        }
        const behavior = effects[cardData?.effectId || ''];
        if (behavior?.onCycle) {
            const result = behavior.onCycle(buildArgs(i));
            if(result.selfUpdate) {
                slotUpdates[i] = { ...(slotUpdates[i] || {}), ...result.selfUpdate };
            }
            return result;
        }
        return { outputs: {} };
    });
    
    const rawOutputs: Record<string, number>[] = cycleResults.map(r => r.outputs);

    // 2. Apply Adjacency Modifiers
    const finalOutputs = JSON.parse(JSON.stringify(rawOutputs)) as Record<string, number>[];
    const wheelJudgementSynergy = activeSynergies.some(s => s.id === 'WHEEL_JUDGEMENT');
    
    effectiveSlots.forEach((slot, i) => {
        if (!slot.card) return;
        const cardData = getCardData(slot.card);
        const rightIdx = (i + 1) % slots.length;
        const leftIdx = (i + slots.length - 1) % slots.length;

        if (cardData?.effectId === 'THE_MAGICIAN') {
          Object.keys(finalOutputs[rightIdx]).forEach(key => finalOutputs[rightIdx][key] *= 2);
        }
        if (cardData?.effectId === 'STRENGTH') { 
          Object.keys(finalOutputs[rightIdx]).forEach(key => finalOutputs[rightIdx][key] = (finalOutputs[rightIdx][key] || 0) + 1);
          Object.keys(finalOutputs[leftIdx]).forEach(key => finalOutputs[leftIdx][key] = (finalOutputs[leftIdx][key] || 0) + 1);
        }
        if (cardData?.effectId === 'JUDGEMENT') {
            for (const key in rawOutputs[rightIdx]) {
                finalOutputs[i][key] = (finalOutputs[i][key] || 0) + rawOutputs[rightIdx][key] * 0.5;
            }
            for (const key in rawOutputs[leftIdx]) {
                finalOutputs[i][key] = (finalOutputs[i][key] || 0) + rawOutputs[leftIdx][key] * 0.5;
            }
            if (!wheelJudgementSynergy) {
              Object.keys(finalOutputs[rightIdx]).forEach(key => finalOutputs[rightIdx][key] *= 0.75);
              Object.keys(finalOutputs[leftIdx]).forEach(key => finalOutputs[leftIdx][key] *= 0.75);
            }
        }
    });

    // 3. Apply Global Modifiers
    let synergyResources = 0;
    const foolWorldSynergy = activeSynergies.find(s => s.id === 'FOOL_WORLD');
    if (foolWorldSynergy) {
        const hour = globalHours % 24;
        if (hour >= 6 && hour <= 18) {
            synergyResources += foolWorldSynergy.isEmpowered ? 3.75 : 3;
        }
    }

    effectiveSlots.forEach((slot, i) => {
        if (!slot.card) return;
        const hasSun = effectiveSlots.some(s => getCardData(s.card)?.effectId === 'THE_SUN');
        
        Object.keys(finalOutputs[i]).forEach(key => {
            let value = finalOutputs[i][key];
            if (hasSun && isMidDay) value *= 4;
            if (slot.card!.effectMultiplier) value *= slot.card!.effectMultiplier;
            globalBuffs.forEach(buff => { if (buff.type === 'EFFECT_MULTIPLIER') value *= buff.modifier; });
            if (slot.card!.curse?.type === 'ISOLATED') value *= 1.5;
            finalOutputs[i][key] = value;
        });
    });

    // 4. Temperance Equalization
    const hasTemperance = effectiveSlots.some(s => getCardData(s.card)?.effectId === 'TEMPERANCE');
    if (hasTemperance) {
        const allKeys = new Set<string>();
        finalOutputs.forEach(output => Object.keys(output).forEach(key => allKeys.add(key)));

        allKeys.forEach(key => {
            const activeOutputsForKey = finalOutputs
                .map((output, idx) => ({ val: output[key] || 0, idx }))
                .filter(item => item.val !== 0);
            
            if (activeOutputsForKey.length > 1) {
                const avg = activeOutputsForKey.reduce((acc, item) => acc + item.val, 0) / activeOutputsForKey.length;
                activeOutputsForKey.forEach(item => {
                    if (finalOutputs[item.idx]) {
                        finalOutputs[item.idx][key] = avg;
                    }
                });
            }
        });
    }

    // 5. Aggregate final values
    let totalResources = 0;
    let totalTimeAdjustment = 0;

    finalOutputs.forEach(output => {
        if (output.resources) totalResources += output.resources;
        if (output.timeAdjustment) totalTimeAdjustment += output.timeAdjustment;
    });
    totalResources += synergyResources;
    
    return { totalResources, slotUpdates, timeAdjustment: totalTimeAdjustment };
};

export const activateCardEffect = (
    slotIndex: number, 
    slots: CircleSlot[], 
    globalArgs: Omit<EffectArgs, 'cardInstance' | 'slotIndex'>
) => {
    const cardInstance = slots[slotIndex].card;
    if (!cardInstance) return;
    const cardData = getCardData(cardInstance);
    const behavior = effects[cardData?.effectId || ''];
    
    if (behavior?.onActivate) {
        behavior.onActivate({ ...globalArgs, cardInstance, slotIndex });
    }
};

export const handleRestock = (
    shopItems: ShopItem[],
    slots: CircleSlot[],
    globalArgs: Omit<EffectArgs, 'cardInstance' | 'slotIndex' | 'shopItems'>
) => {
    slots.forEach((slot) => {
        if(slot.card && getCardData(slot.card)?.effectId === 'WHEEL_OF_FORTUNE') {
            if (Math.random() < 0.15 && shopItems.length > 0) {
                 const idx = Math.floor(Math.random() * shopItems.length);
                 shopItems[idx].cost = 0;
            }
        }
    });
    return shopItems;
};

export const KF_B2 = "22L";
export const KF_C6 = "36I";