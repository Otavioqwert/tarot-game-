import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CycleState, ShopItem, Card, CircleSlot, Rarity, ItemType, CardInstance, GlobalBuff, PendingPayout, SaveState, SavedCardInstance
} from './types';
import { 
  TICK_RATE, DAILY_MAX, LUNAR_MAX, SIGN_MAX, TAROT_LIBRARY, ZODIAC_SIGNS, LUNAR_PHASES, DAY_START, DAY_END, BLANK_CARD_DATA
} from './constants';
import { processCycle, activateCardEffect, handleRestock, cardHandlers } from './effects';
import { calculateComplexSync } from './syncLogic';
import { getActiveSynergies } from './synergies';
import { encodeSaveData, decodeSaveData } from './utils/saveManager';
import CycleDisplay from './components/CycleDisplay';
import CardCircle from './components/CardCircle';
import Shop from './components/Shop';
import Inventory from './components/Inventory';
import ChoiceModal from './components/ChoiceModal';
import HangedManSacrifice from './components/HangedManSacrifice';
import TheDevilModal from './components/TheDevilModal';
import SynergyDisplay from './components/SynergyDisplay';
import SaveLoadModal from './components/SaveLoadModal';

const BASE_RESOURCE_RATE = 0.05;
const SAVE_VERSION = 1;

// ⏱️ Duração fixa de cada ciclo da Imperatriz: 30s
const EMPRESS_CYCLE_DURATION_MS = 30000;

const App: React.FC = () => {
  const [currency, setCurrency] = useState(4999);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('inventory');
  const [globalHours, setGlobalHours] = useState(0);
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState<number | null>(null);
  const [tickRate, setTickRate] = useState(TICK_RATE);
  const [globalBuffs, setGlobalBuffs] = useState<GlobalBuff[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [permanentSyncBonus, setPermanentSyncBonus] = useState(0);
  const [cardChoice, setCardChoice] = useState<{ cards: Card[], sourceSlot: number, extraChoices: number } | null>(null);
  const [isRestocking, setIsRestocking] = useState(false);
  const [hangedManState, setHangedManState] = useState<{ isOpen: boolean; sourceSlot: number; sacrificedCards: CardInstance[]; } | null>(null);
  const [devilSacrificeState, setDevilSacrificeState] = useState<{ isOpen: boolean; sourceSlot: number } | null>(null);
  const [synergyResourceRate, setSynergyResourceRate] = useState(0);
  const [saveLoadModal, setSaveLoadModal] = useState<{ isOpen: boolean; mode: 'save' | 'load'; code?: string }>({ isOpen: false, mode: 'save' });

  const [cycle, setCycle] = useState<CycleState>({
    daily: 0, lunar: 0, sign: 0, cycleDuration: TICK_RATE,
    dailyComplete: false, lunarComplete: false, signComplete: false
  });

  const [inventory, setInventory] = useState<CardInstance[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [slots, setSlots] = useState<CircleSlot[]>([
    { position: 0, card: null, syncPercentage: 0 },
    { position: 1, card: null, syncPercentage: 0 },
    { position: 2, card: null, syncPercentage: 0 }
  ]);
  
  const activeSynergies = useMemo(() => getActiveSynergies(slots), [slots]);

  // 🔄 Estado de ciclos da Imperatriz (por instância)
  const [empressStates, setEmpressStates] = useState<Record<string, {
    isActive: boolean;
    cyclesLeft: number; // 0 = ativo, 1-3 = inativo
    lastTick: number;   // timestamp do último avanço de ciclo
  }>>({});

  useEffect(() => {
    const hasEmpressEmperor = activeSynergies.some(s => s.id === 'EMPRESS_EMPEROR');
    if (hasEmpressEmperor && slots.length === 3) {
      setSlots(s => [...s, { position: 3, card: null, syncPercentage: 0 }]);
    } else if (!hasEmpressEmperor && slots.length === 4) {
      const fourthCard = slots[3].card;
      if (fourthCard) {
        setInventory(inv => [...inv, fourthCard]);
      }
      setSlots(s => s.slice(0, 3));
    }
  }, [activeSynergies, slots.length]);

  const currentSignIndex = useMemo(() => Math.floor(globalHours / SIGN_MAX) % ZODIAC_SIGNS.length, [globalHours]);
  const currentPhaseIndex = useMemo(() => Math.floor(cycle.lunar / 42) % 4, [cycle.lunar]);
  
  const daylightIntensity = useMemo(() => {
    const hour = globalHours % 24;
    if (hour < DAY_START || hour > DAY_END) return 0;
    const peakHour = 12;
    const distanceToPeak = Math.abs(hour - peakHour);
    const maxDistance = hour < peakHour ? (peakHour - DAY_START) : (DAY_END - peakHour);
    const intensity = 1 - (distanceToPeak / maxDistance);
    return Math.max(0, Math.min(1, intensity));
  }, [globalHours]);
  
  const isDayTime = useMemo(() => {
    const hour = globalHours % 24;
    return hour >= DAY_START && hour <= DAY_END;
  }, [globalHours]);

  useEffect(() => {
    document.body.style.setProperty('--day-glow-color', `rgba(45, 29, 12, ${daylightIntensity})`);
  }, [daylightIntensity]);

  const globalSync = useMemo(() => {
    return calculateComplexSync({
        slots,
        currentSignIndex,
        currentPhaseIndex,
        globalHours,
        permanentSyncBonus,
        activeSynergies,
    });
  }, [slots, currentSignIndex, currentPhaseIndex, globalHours, permanentSyncBonus, activeSynergies]);

  const generateShopItems = useCallback(() => {
    const currentSign = ZODIAC_SIGNS[currentSignIndex];
    const currentPhase = LUNAR_PHASES[currentPhaseIndex];
    let newItems: ShopItem[] = [];
    for (let i = 0; i < 3; i++) {
      const originalCard = TAROT_LIBRARY[Math.floor(Math.random() * TAROT_LIBRARY.length)];
      const cardForShop: Card = JSON.parse(JSON.stringify(originalCard));
      if (cardForShop.marks && cardForShop.marks.length > 0) {
        const primaryMark = cardForShop.marks[0];
        if (primaryMark.type === 'sign' && Math.random() < 0.5) {
          primaryMark.name = currentSign.name; primaryMark.icon = currentSign.icon;
        } else if (primaryMark.type === 'lunar' && Math.random() < 0.5) {
          primaryMark.name = currentPhase.name; primaryMark.icon = currentPhase.icon;
        }
      }
      newItems.push({
        id: `card-${Date.now()}-${i}`, name: cardForShop.name, description: cardForShop.effect,
        cost: 100 + (cardForShop.id * 100), type: ItemType.TAROT,
        rarity: Math.random() > 0.85 ? Rarity.RARE : Rarity.COMMON, cardData: cardForShop
      });
    }
    
    newItems = handleRestock(newItems, slots, {
        globalHours, globalSync, slots, activeSynergies,
        setSlots, setInventory, setCurrency, setGlobalHours, setGlobalBuffs, setPendingPayouts, setTickRate, setSynergyResourceRate
    });

    return newItems;
  }, [currentSignIndex, currentPhaseIndex, slots, globalHours, globalSync, activeSynergies]);

  useEffect(() => {
    const timer = setInterval(() => setGlobalHours(h => h + 1), tickRate);
    return () => clearInterval(timer);
  }, [tickRate]);

  useEffect(() => {
    const currentSignName = ZODIAC_SIGNS[currentSignIndex].name;
    const currentPhaseName = LUNAR_PHASES[currentPhaseIndex].name;
    const synergySunMoon = activeSynergies.some(s => s.id === 'SUN_MOON');

    const newSlots = slots.map((slot) => {
      if (!slot.card || !slot.card.marks || slot.card.marks.length === 0 || slot.card.isBlank) {
        return { ...slot, syncPercentage: 0 };
      }

      const activeMarksCount = slot.card.marks.filter(
        (mark) =>
          (mark.type === 'lunar' && (isDayTime || synergySunMoon) && mark.name === currentPhaseName) ||
          (mark.type === 'sign' && mark.name === currentSignName)
      ).length;

      const totalMarks = slot.card.marks.length;
      const syncPercentage = totalMarks > 0 ? (activeMarksCount / totalMarks) * 100 : 0;
      
      return { ...slot, syncPercentage: Math.floor(syncPercentage) };
    });

    const needsUpdate = newSlots.some((newSlot, index) => slots[index] && newSlot.syncPercentage !== slots[index].syncPercentage);
    if (needsUpdate) {
        setSlots(newSlots);
    }
  }, [slots, currentSignIndex, currentPhaseIndex, globalHours, isDayTime, activeSynergies]);

  // 🔄 Loop de ciclos da Imperatriz: avança a cada 30s por instância
  useEffect(() => {
    const interval = setInterval(() => {
      setEmpressStates(prev => {
        const now = Date.now();
        const next: typeof prev = { ...prev };

        Object.keys(next).forEach(id => {
          const state = next[id];
          const elapsed = now - state.lastTick;

          if (elapsed >= EMPRESS_CYCLE_DURATION_MS) {
            if (state.cyclesLeft > 0) {
              // Continua inativa, decrementa ciclo
              next[id] = {
                ...state,
                cyclesLeft: state.cyclesLeft - 1,
                isActive: false,
                lastTick: now
              };
            } else {
              // Entra no ciclo ativo (1 bloco de 30s)
              next[id] = {
                ...state,
                isActive: true,
                cyclesLeft: 3,
                lastTick: now
              };
            }
          }
        });

        return next;
      });
    }, 1000); // checa a cada 1s

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (globalHours === 0) {
      setShopItems(generateShopItems());
      return;
    }

    const { totalResources, slotUpdates, timeAdjustment } = processCycle(
        slots, globalHours, globalSync, globalBuffs, activeSynergies,
        setSlots, setInventory, setCurrency, setGlobalHours, setGlobalBuffs, setPendingPayouts, setTickRate, setSynergyResourceRate
    );

    if (timeAdjustment > 0) {
        setGlobalHours(h => h + timeAdjustment);
        return; 
    }

    const duePayouts = pendingPayouts.filter(p => p.deliveryTime <= globalHours);
    if(duePayouts.length > 0) {
        const totalPayout = duePayouts.reduce((sum, p) => sum + p.amount, 0);
        setCurrency(c => c + totalPayout);
        setPendingPayouts(p => p.filter(payout => payout.deliveryTime > globalHours));
    }
    
    setGlobalBuffs(buffs => buffs.map(b => ({ ...b, duration: b.duration - 1 })).filter(b => b.duration > 0));

    const currentDaily = globalHours % DAILY_MAX;
    const dailyComplete = globalHours > 0 && currentDaily === 0;
    setCycle(prev => ({ ...prev, daily: currentDaily, lunar: globalHours % LUNAR_MAX, sign: globalHours % SIGN_MAX, dailyComplete }));

    if (dailyComplete) {
        setIsRestocking(true);
        setTimeout(() => {
            setShopItems(generateShopItems());
            setIsRestocking(false);
        }, 4000); // Animation duration
    }
    
    setCurrency(c => c + totalResources);
    
    if (Object.keys(slotUpdates).length > 0) {
      setSlots(prevSlots => {
          const newSlots = JSON.parse(JSON.stringify(prevSlots));
          Object.entries(slotUpdates).forEach(([indexStr, update]) => {
              const index = parseInt(indexStr, 10);
              if (newSlots[index] && newSlots[index].card) {
                  newSlots[index].card = { ...newSlots[index].card, ...update };
              }
          });
          return newSlots;
      });
    }

  }, [globalHours]);

  // ✅ FIX: Recursos fixos (Hierophant+Hermit) separados de recursos afetados por sync
  useEffect(() => {
    // BASE_RESOURCE_RATE é afetado por sync
    const baseRateWithSync = BASE_RESOURCE_RATE * (1 + globalSync / 100);
    
    // synergyResourceRate (Hierophant+Hermit) é FIXO (não afetado por sync)
    const fixedSynergyRate = synergyResourceRate / 30;
    
    const totalRate = baseRateWithSync + fixedSynergyRate;
    
    const resourceTimer = setInterval(() => {
      setCurrency(c => c + totalRate);
    }, 1000);
    return () => clearInterval(resourceTimer);
  }, [globalSync, synergyResourceRate]);
  
  const createCardInstance = (card: Card): CardInstance => ({
      instanceId: `${Date.now()}-${Math.random()}`,
      cardId: card.id,
      marks: JSON.parse(JSON.stringify(card.marks || []))
  });

  const handleBuy = (item: ShopItem) => {
    if (currency >= item.cost && item.cardData) {
      setCurrency(prev => prev - item.cost);
      setInventory(prev => [...prev, createCardInstance(item.cardData!)]);
      setShopItems(prev => prev.filter(i => i.id !== item.id));
    }
  };
  
  const handlePlaceCard = (slotIndex: number) => {
    const targetSlot = slots[slotIndex];
    if (selectedInventoryIndex === null || (targetSlot.card && !targetSlot.card.isBlank)) return;

    const cardToPlace = inventory[selectedInventoryIndex];
    const newSlots = [...slots];
    newSlots[slotIndex].card = cardToPlace;
    const newInventory = inventory.filter((_, i) => i !== selectedInventoryIndex);
    setInventory(newInventory); setSlots(newSlots); setSelectedInventoryIndex(null);
  };

  const handleRemoveCard = (slotIdx: number) => {
    const cardInstance = slots[slotIdx].card;
    if (!cardInstance || cardInstance.isBlank) return;
    const newSlots = [...slots];
    newSlots[slotIdx].card = null;
    setInventory(prev => [...prev, cardInstance]); setSlots(newSlots);
  };
  
  const handleReturnReadyActivations = () => {
    setSlots(prevSlots => {
      const newSlots = prevSlots.map(slot => ({ ...slot }));
      const returning: CardInstance[] = [];

      newSlots.forEach((slot, idx) => {
        const card = slot.card;
        if (!card || card.isBlank) return;

        const cardData = TAROT_LIBRARY.find(c => c.id === card.cardId);
        if (!cardData?.effectId) return;

        const handler = cardHandlers[cardData.effectId];
        const isActivatable = !!handler?.onActivate;
        const isOnCooldown = card.cooldownUntil && card.cooldownUntil > globalHours;

        // Só devolve cartas ativáveis e prontas (sem cooldown)
        if (isActivatable && !isOnCooldown) {
          returning.push(card);
          newSlots[idx] = { ...slot, card: null, syncPercentage: 0 };
        }
      });

      if (returning.length > 0) {
        setInventory(prevInv => [...prevInv, ...returning]);
      }

      return newSlots;
    });
  };
  
  const handleActivateEffect = (slotIndex: number) => {
      const cardInstance = slots[slotIndex].card;
      if (!cardInstance) return;
      const cardData = TAROT_LIBRARY.find(c => c.id === cardInstance.cardId);
      if (!cardData) return;

      // 🎴 Registro/Reset dos ciclos da Imperatriz quando clicada
      if (cardData.name === 'Imperatriz' || cardData.name === 'The Empress') {
        setEmpressStates(prev => ({
          ...prev,
          [cardInstance.instanceId]: {
            isActive: true,
            cyclesLeft: 3, // depois deste clique, ela entra no ciclo 3 inativos + 1 ativo
            lastTick: Date.now()
          }
        }));
      }

      if (cardData.effectId === 'THE_LOVERS') {
          const blankCardsInCircle = slots.filter(s => s.card?.isBlank).length;
          const synergyLovers = activeSynergies.find(s => s.id === 'LOVERS_BLANK');
          const extraChoices = synergyLovers ? blankCardsInCircle : 0;
          
          let card1 = TAROT_LIBRARY[Math.floor(Math.random() * TAROT_LIBRARY.length)];
          let card2 = TAROT_LIBRARY[Math.floor(Math.random() * TAROT_LIBRARY.length)];
          while (card1.id === card2.id) { card2 = TAROT_LIBRARY[Math.floor(Math.random() * TAROT_LIBRARY.length)]; }
          
          const choices = [card1, card2];
          for(let i=0; i < extraChoices; i++) {
              let extraCard = TAROT_LIBRARY[Math.floor(Math.random() * TAROT_LIBRARY.length)];
              while(choices.some(c => c.id === extraCard.id)) {
                  extraCard = TAROT_LIBRARY[Math.floor(Math.random() * TAROT_LIBRARY.length)];
              }
              choices.push(extraCard);
          }
          if (synergyLovers && synergyLovers.isEmpowered && blankCardsInCircle >= 2) {
              let extraCard = TAROT_LIBRARY[Math.floor(Math.random() * TAROT_LIBRARY.length)];
              while(choices.some(c => c.id === extraCard.id)) {
                  extraCard = TAROT_LIBRARY[Math.floor(Math.random() * TAROT_LIBRARY.length)];
              }
              choices.push(extraCard);
          }

          setCardChoice({ cards: choices, sourceSlot: slotIndex, extraChoices });
          return;
      }
      
      if (cardData.effectId === 'THE_HANGED_MAN') {
          setHangedManState({ isOpen: true, sourceSlot: slotIndex, sacrificedCards: [] });
          return;
      }
      
      if (cardData.effectId === 'THE_DEVIL') {
          setDevilSacrificeState({ isOpen: true, sourceSlot: slotIndex });
          return;
      }
      
      activateCardEffect(
        slotIndex,
        slots,
        globalHours,
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
        setSynergyResourceRate
      );
  };

  const handleInventoryClick = (index: number) => {
    if (selectedInventoryIndex === index) setSelectedInventoryIndex(null);
    else setSelectedInventoryIndex(index);
  };
  
  const handleCardChoice = (chosenCard: Card) => {
    if (!cardChoice) return;
    
    // Safety check: ensure cardChoice.cards exists and is an array
    if (!Array.isArray(cardChoice.cards) || cardChoice.cards.length === 0) {
      console.warn('Invalid cardChoice.cards');
      return;
    }
    
    setInventory(prev => [...prev, createCardInstance(chosenCard)]);
    
    const newSlots = [...slots];
    // Consume blank cards if they were used
    if (cardChoice.extraChoices > 0) {
      let consumedCount = 0;
      for (let i = 0; i < newSlots.length && consumedCount < cardChoice.extraChoices; i++) {
        if (newSlots[i].card?.isBlank) {
          newSlots[i].card = null;
          consumedCount++;
        }
      }
    }

    const originalLovers = newSlots[cardChoice.sourceSlot].card;
    if (originalLovers) {
      newSlots[cardChoice.sourceSlot].card = {
        instanceId: `blank-${Date.now()}`,
        cardId: BLANK_CARD_DATA.id,
        isBlank: true,
        name: BLANK_CARD_DATA.name,
        marks: originalLovers.marks,
      };
    }
    setSlots(newSlots);
    setCardChoice(null);
  };

  const handleConfirmHangedManSacrifice = (sacrificed: CardInstance[]) => {
    if (!hangedManState) return;
    
    // Safety check: ensure sacrificed is an array
    if (!Array.isArray(sacrificed)) {
      console.warn('Invalid sacrificed array');
      return;
    }
    
    const n = sacrificed.length;
    if (n > 0) {
      const payout = ((n + 1) * n / 2) * 50;
      setPendingPayouts(prev => [...prev, { amount: payout, deliveryTime: globalHours + LUNAR_MAX }]);
      
      setSlots(prevSlots => {
        const newSlots = [...prevSlots];
        const cardInSlot = newSlots[hangedManState.sourceSlot].card;
        if (cardInSlot) {
          newSlots[hangedManState.sourceSlot] = {
            ...newSlots[hangedManState.sourceSlot],
            card: {
              ...cardInSlot,
              cooldownUntil: globalHours + LUNAR_MAX,
            }
          };
        }
        return newSlots;
      });
    }
    setInventory(inv => inv.filter(card => !sacrificed.some(sac => sac.instanceId === card.instanceId)));
    setHangedManState(null);
  };

  const handleConfirmDevilSacrifice = (selected: { cardInstanceId: string; markIndex: number }[]) => {
    if (!devilSacrificeState || !Array.isArray(selected) || selected.length === 0) return;

    const newSlots = [...slots];
    const rewards: string[] = [];

    // Process each sacrificed mark
    selected.forEach(({ cardInstanceId, markIndex }) => {
      // Find the card instance in the circle
      let foundCard = false;
      newSlots.forEach(slot => {
        if (slot.card?.instanceId === cardInstanceId) {
          // Remove the mark
          if (slot.card.marks && slot.card.marks[markIndex]) {
            slot.card.marks.splice(markIndex, 1);
            foundCard = true;

            // Apply curse
            const curseTypes = ['ISOLATED', 'VOLATILE', 'TEMPORAL'] as const;
            const curseType = curseTypes[Math.floor(Math.random() * curseTypes.length)];
            slot.card.curse = {
              id: `curse-${Date.now()}-${Math.random()}`,
              type: curseType,
            };

            // Generate reward (50% chance of double reward)
            const rewardCount = Math.random() < 0.5 ? 2 : 1;
            for (let r = 0; r < rewardCount; r++) {
              const rewardType = Math.random();
              if (rewardType < 0.33) {
                rewards.push('+250 Recursos 💰');
                setCurrency(c => c + 250);
              } else if (rewardType < 0.66) {
                rewards.push('+5 Sync Permanente ⚡');
                setPermanentSyncBonus(p => p + 5);
              } else {
                rewards.push('+1 Multiplicador 📈');
                // Increase The Devil's effect multiplier
                const devilCard = newSlots[devilSacrificeState.sourceSlot].card;
                if (devilCard) {
                  devilCard.effectMultiplier = (devilCard.effectMultiplier || 1) + 1;
                }
              }
            }
          }
        }
      });
    });

    setSlots(newSlots);
    setDevilSacrificeState(null);
  };

    // --- Save/Load Logic ---
    const toSavedCard = (card: CardInstance): SavedCardInstance => ({
        cid: card.cardId,
        iid: card.instanceId,
        m: card.marks,
        ...(card.cooldownUntil && { cd: card.cooldownUntil }),
        ...(card.curse && { cr: card.curse }),
        ...(card.isBlank && { ib: card.isBlank }),
        ...(card.justiceBonus && { jb: card.justiceBonus }),
        ...(card.towerCycles && { tc: card.towerCycles }),
        ...(card.effectMultiplier && { em: card.effectMultiplier }),
        ...(card.hangedManActive && { hma: card.hangedManActive }),
        ...(card.hangedManConsumes && { hmc: card.hangedManConsumes }),
        ...(card.hangedManActivatedAt && { hmaa: card.hangedManActivatedAt }),
    });

    const fromSavedCard = (saved: SavedCardInstance): CardInstance => ({
        cardId: saved.cid,
        instanceId: saved.iid,
        marks: saved.m,
        cooldownUntil: saved.cd,
        curse: saved.cr,
        isBlank: saved.ib,
        justiceBonus: saved.jb,
        towerCycles: saved.tc,
        effectMultiplier: saved.em,
        hangedManActive: saved.hma,
        hangedManConsumes: saved.hmc,
        hangedManActivatedAt: saved.hmaa,
    });
  
    const handleExport = () => {
        const state: SaveState = {
            v: SAVE_VERSION,
            cur: currency,
            gh: globalHours,
            tr: tickRate,
            psb: permanentSyncBonus,
            inv: inventory.map(toSavedCard),
            sl: slots.map(s => s.card ? toSavedCard(s.card) : null),
            pp: pendingPayouts,
            gb: globalBuffs,
        };
        const code = encodeSaveData(state);
        setSaveLoadModal({ isOpen: true, mode: 'save', code });
    };

    const handleImport = (code: string) => {
        const state = decodeSaveData(code);
        if (!state || state.v !== SAVE_VERSION) {
            alert('Código de salvamento inválido ou incompatível!');
            return;
        }
        
        // Load state
        setCurrency(state.cur);
        setGlobalHours(state.gh);
        setTickRate(state.tr);
        setPermanentSyncBonus(state.psb);
        setInventory(state.inv?.map(fromSavedCard) || []);
        setSlots(prevSlots => (state.sl || []).map((sc, i) => ({
            position: prevSlots[i]?.position ?? i as (0|1|2|3),
            card: sc ? fromSavedCard(sc) : null,
            syncPercentage: 0 // Will be recalculated
        })));
        setPendingPayouts(state.pp || []);
        setGlobalBuffs(state.gb || []);
        
        setSaveLoadModal({ isOpen: false, mode: 'load' });
        alert('Jogo carregado com sucesso!');
    };

  return (
    <div className={`min-h-screen text-slate-200 flex flex-col items-center transition-all duration-1000 ${isDayTime ? 'theme-day' : ''}`}>
      <header className="w-full bg-[#0a0f1d]/80 border-b border-indigo-900/30 p-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md transition-colors duration-1000">
        <div>
          <h1 className="text-2xl font-mystic text-indigo-300 tracking-wider header-title transition-colors duration-1000">AETHER SYNDICATE</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${globalSync > 50 ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-600'}`} />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">SINCRONIA: {globalSync}%</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <div className="text-right hidden sm:block">
              <span className="text-[9px] text-slate-500 uppercase block">Regente</span>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <div className="bg-purple-900/70 w-5 h-5 flex items-center justify-center rounded-md backdrop-blur-sm border border-purple-500/30">
                    <span className="text-white text-xs select-none">{ZODIAC_SIGNS[currentSignIndex].icon}</span>
                </div>
                <span className="text-xs font-mystic text-amber-400">{ZODIAC_SIGNS[currentSignIndex].name}</span>
              </div>
           </div>
           <div className="flex items-center space-x-2">
                <button onClick={handleExport} className="text-[10px] bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-bold px-3 py-1 rounded-md transition-colors border border-slate-600">Exportar</button>
                <button onClick={() => setSaveLoadModal({ isOpen: true, mode: 'load' })} className="text-[10px] bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-bold px-3 py-1 rounded-md transition-colors border border-slate-600">Importar</button>
            </div>
           <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-indigo-500/20 flex items-center space-x-3">
            <span className="text-amber-500 text-lg">✨</span>
            <span className="font-bold text-slate-100">{currency.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col items-center space-y-8">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <CycleDisplay cycle={cycle} currentSignIndex={currentSignIndex} isDayTime={isDayTime} />
            </div>
            <SynergyDisplay synergies={activeSynergies} isDayTime={isDayTime} globalHours={globalHours} />
          </div>
          <div className="relative py-12">
            <CardCircle 
              slots={slots} 
              onRemove={handleRemoveCard} 
              onPlace={handlePlaceCard} 
              selectedCardIndex={selectedInventoryIndex} 
              onActivate={handleActivateEffect} 
              globalHours={globalHours}
              empressStates={empressStates}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-4xl opacity-10 font-mystic text-indigo-500 block uppercase tracking-[0.5em]">{ZODIAC_SIGNS[currentSignIndex].name}</span>
            </div>
          </div>
          <div className="mt-2 flex justify-center">
            <button
              onClick={handleReturnReadyActivations}
              className="text-[10px] bg-amber-500/80 hover:bg-amber-400 text-black font-bold px-3 py-1 rounded-full border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)] transition-colors"
            >
              Recolher Arcanos Prontos
            </button>
          </div>
        </div>
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            <button onClick={() => { setActiveTab('inventory'); setSelectedInventoryIndex(null); }} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>COLEÇÃO ({inventory.length})</button>
            <button onClick={() => { setActiveTab('shop'); setSelectedInventoryIndex(null); }} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'shop' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>MERCADO</button>
          </div>
          <div className="min-h-[400px]">
            {activeTab === 'shop' ? <Shop items={shopItems} onBuy={handleBuy} isRestocking={isRestocking} /> : <Inventory cards={inventory} onCardClick={handleInventoryClick} selectedIndex={selectedInventoryIndex} />}
          </div>
        </div>
      </main>
      
      {saveLoadModal.isOpen && (
        <SaveLoadModal
          mode={saveLoadModal.mode}
          saveCode={saveLoadModal.code}
          onClose={() => setSaveLoadModal({ isOpen: false, mode: 'save' })}
          onLoad={handleImport}
        />
      )}

      {cardChoice && <ChoiceModal cards={cardChoice.cards} onSelect={handleCardChoice} />}
      {hangedManState?.isOpen && (
        <HangedManSacrifice
          inventory={inventory}
          onConfirm={handleConfirmHangedManSacrifice}
          onCancel={() => setHangedManState(null)}
        />
      )}
      {devilSacrificeState?.isOpen && (
        <TheDevilModal
          inventory={inventory}
          onConfirm={handleConfirmDevilSacrifice}
          onCancel={() => setDevilSacrificeState(null)}
        />
      )}
      
      {cycle.dailyComplete && !isRestocking && ( <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-indigo-600/90 text-white px-6 py-2 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-400 animate-pulse z-50">Um novo dia em {ZODIAC_SIGNS[currentSignIndex].name}! Mercado Atualizado.</div> )}
    </div>
  );
};

export default App;
