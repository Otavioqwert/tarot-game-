
import { CircleSlot, CardInstance, Card, SyncType } from './types';
import { ZODIAC_SIGNS, LUNAR_PHASES, TAROT_LIBRARY, DAY_START, DAY_END } from './constants';
import { ActiveSynergy } from './synergies';

const getCardData = (instance?: CardInstance | null): Card | undefined => {
    if (!instance) return undefined;
    if (instance.isBlank) return undefined;
    return TAROT_LIBRARY.find(c => c.id === instance.cardId);
};

interface SyncParams {
    slots: CircleSlot[];
    currentSignIndex: number;
    currentPhaseIndex: number;
    globalHours: number;
    permanentSyncBonus: number;
    activeSynergies: ActiveSynergy[];
}

export const calculateComplexSync = ({ 
    slots, currentSignIndex, currentPhaseIndex, globalHours, permanentSyncBonus, activeSynergies
}: SyncParams): number => {
    
    const cards = slots.map(s => s.card ? { instance: s.card, data: getCardData(s.card) } : null).filter(c => c !== null && c.data);
    
    let hasEmperor = false, hasStar = false, hasMoon = false;
    let justiceBonus = 0;
    
    cards.forEach(c => {
        const data = c!.data!;
        const instance = c!.instance;
        if (data.effectId === 'THE_EMPEROR') hasEmperor = true;
        if (data.effectId === 'THE_STAR') hasStar = true;
        if (data.effectId === 'THE_MOON') hasMoon = true;
        if (data.effectId === 'JUSTICE') justiceBonus += instance.justiceBonus || 0;
    });
    
    const synergySunMoon = activeSynergies.some(s => s.id === 'SUN_MOON');

    const currentSignName = ZODIAC_SIGNS[currentSignIndex].name;
    const currentPhaseName = LUNAR_PHASES[currentPhaseIndex].name;
    const currentHour = globalHours % 24;
    const isDayTime = currentHour >= DAY_START && currentHour <= DAY_END;

    let lunarContribution = hasMoon ? 1.0 : 0.5;
    if(synergySunMoon) lunarContribution = 1.0; // Anula a penalidade da Lua
    
    const signContribution = hasMoon ? 0.3 : 0.5;

    const validCards = cards.filter(c => !c!.instance.curse || c!.instance.curse?.type !== 'ISOLATED');
    if (validCards.length === 0) return Math.floor(permanentSyncBonus + justiceBonus);

    const allMarks = validCards.flatMap(c => c!.instance.marks || []);
    const lunarMarks = allMarks.filter(mark => mark.type === 'lunar');
    const signMarks = allMarks.filter(mark => mark.type === 'sign');

    const uniqueLunarMarkNames = new Set(lunarMarks.map(m => m.name));
    const uniqueSignMarkNames = new Set(signMarks.map(m => m.name));

    const count_tipos_lua = uniqueLunarMarkNames.size;
    const count_tipos_signo = uniqueSignMarkNames.size;
    
    let tipos_lua_sincronizados = 0;
    if (!isDayTime || synergySunMoon) {
      if (uniqueLunarMarkNames.has(currentPhaseName)) {
          tipos_lua_sincronizados = 1;
      }
    }
    
    let tipos_signo_sincronizados = 0;
    if (uniqueSignMarkNames.has(currentSignName)) {
        tipos_signo_sincronizados = 1;
    }

    let lunarSync = count_tipos_lua > 0 ? (lunarContribution / count_tipos_lua) * tipos_lua_sincronizados : 0;
    let signSync = count_tipos_signo > 0 ? (signContribution / count_tipos_signo) * tipos_signo_sincronizados : 0;
    
    let totalSync = (lunarSync + signSync) * 100;
    
    const synergySunMoonEmpowered = activeSynergies.some(s => s.id === 'SUN_MOON' && s.isEmpowered);
    if (synergySunMoon) {
        totalSync *= synergySunMoonEmpowered ? 0.80 : 0.75;
    }


    if (hasStar) {
        totalSync += 20;
        const patterns: Record<string, number> = {};
        validCards.forEach(c => {
             const marksStr = c!.instance.marks.map(m => m.name).sort().join('+');
             patterns[marksStr] = (patterns[marksStr] || 0) + 1;
        });
        let maxCount = 0;
        Object.values(patterns).forEach(count => { if(count > maxCount) maxCount = count; });
        const dominantPatterns = Object.keys(patterns).filter(k => patterns[k] === maxCount);

        let starBonus = 0;
        validCards.forEach(c => {
            if (c!.data!.effect.toLowerCase().includes('sync') || c!.data!.effect.toLowerCase().includes('sincronia')) {
                const activeMarks = c!.instance.marks.filter(m => 
                    (m.type === 'lunar' && (!isDayTime || synergySunMoon) && m.name === currentPhaseName) ||
                    (m.type === 'sign' && m.name === currentSignName)
                ).length;
                let cardBonus = 30 * activeMarks;
                const myPattern = c!.instance.marks.map(m => m.name).sort().join('+');
                if (!dominantPatterns.includes(myPattern)) {
                    cardBonus /= 2; 
                }
                starBonus += cardBonus;
            }
        });
        totalSync += starBonus;
    }

    let externalBonus = permanentSyncBonus + justiceBonus;
    const synergyWheelJudgement = activeSynergies.find(s => s.id === 'WHEEL_JUDGEMENT');
    if (synergyWheelJudgement?.isEmpowered) {
        externalBonus /= 4;
    }
    
    totalSync += externalBonus;

    if (hasEmperor) {
        totalSync *= 1.25;
    }

    if (synergyWheelJudgement) {
        totalSync = Math.max(25, Math.min(totalSync, 75));
    }
    
    return Math.floor(totalSync);
};

export const KF_D4 = "44L";
export const KF_B4 = "24I";
