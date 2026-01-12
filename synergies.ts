
import { CircleSlot } from './types';

export interface Synergy {
    id: string;
    name: string;
    cards: [string, string];
    description: string;
    descriptionEmperor: string;
    icon: string;
    constellationPath: string; // SVG path data
}

export interface ActiveSynergy extends Synergy {
    isEmpowered: boolean;
}

const getCardEffectId = (slot: CircleSlot) => slot.card?.cardId !== undefined ?
    (TAROT_LIBRARY.find(c => c.id === slot.card!.cardId)?.effectId || null) : null;

// Assuming TAROT_LIBRARY is available or can be imported
import { TAROT_LIBRARY } from './constants';

export const SYNERGIES: Synergy[] = [
    {
        id: 'FOOL_WORLD',
        name: 'Jornada do Herói',
        cards: ['THE_FOOL', 'THE_WORLD'],
        description: '+3 recursos/ciclo entre 6h-18h.',
        descriptionEmperor: '+3.75 recursos/ciclo entre 6h-18h.',
        icon: '🌀',
        constellationPath: "M10,80 Q50,10 90,80 T170,80"
    },
    {
        id: 'MAGICIAN_PRIESTESS',
        name: 'Ritual Arcano',
        cards: ['THE_MAGICIAN', 'THE_HIGH_PRIESTESS'],
        description: 'Efeitos passivos puros ativam por 5s a cada ciclo.',
        descriptionEmperor: 'Efeitos passivos puros ativam por 6.5s a cada ciclo.',
        icon: '🔮',
        constellationPath: "M20,20 L80,80 M80,20 L20,80"
    },
    {
        id: 'EMPRESS_EMPEROR',
        name: 'Império',
        cards: ['THE_EMPRESS', 'THE_EMPEROR'],
        description: 'Adiciona +1 slot ao Círculo.',
        descriptionEmperor: 'Adiciona +1 slot ao Círculo.',
        icon: '👑',
        constellationPath: "M50,10 L90,50 L50,90 L10,50 Z"
    },
    {
        id: 'HIEROPHANT_HERMIT',
        name: 'Sabedoria Isolada',
        cards: ['THE_HIEROPHANT', 'THE_HERMIT'],
        description: 'Anula efeitos de ambos. Gera 0.5 recursos/s.',
        descriptionEmperor: 'Anula efeitos de ambos. Gera 0.625 recursos/s.',
        icon: '📜',
        constellationPath: "M30,70 Q50,50 70,70 Q90,90 70,110"
    },
    {
        id: 'WHEEL_JUDGEMENT',
        name: 'Karma Inevitável',
        cards: ['WHEEL_OF_FORTUNE', 'JUDGEMENT'],
        description: 'Sync travado entre 25-75%. Anula penalidades de ambas.',
        descriptionEmperor: 'Sync travado entre 25-75%. Bônus externos de Sync aplicados em 1/4.',
        icon: '⚖️',
        constellationPath: "M50,20 C80,20 80,80 50,80 C20,80 20,20 50,20 Z"
    },
    {
        id: 'DEATH_TOWER',
        name: 'Ruína Inevitável',
        cards: ['DEATH', 'THE_TOWER'],
        description: 'A Torre não pode ser consumida. Chance de ativação da Torre aumenta para 50%.',
        descriptionEmperor: 'Chance de ativação da Torre aumenta para 62.5%.',
        icon: '💥',
        constellationPath: "M10,10 L90,90 M50,10 L50,90 M10,50 L90,50"
    },
    {
        id: 'SUN_MOON',
        name: 'Eclipse Eterno',
        cards: ['THE_SUN', 'THE_MOON'],
        description: 'Dia e noite têm o mesmo comportamento. Anula penalidade da Lua, mas reduz sua influência em 25%.',
        descriptionEmperor: 'Influência da Lua reduzida em apenas 20%.',
        icon: '🌗',
        constellationPath: "M30,50 A20,20 0 1,1 70,50 A20,20 0 1,1 30,50"
    },
    {
        id: 'LOVERS_BLANK',
        name: 'Eco do Vazio',
        cards: ['THE_LOVERS', 'BLANK'],
        description: 'Consumir 1 Carta em Branco ao ativar Os Enamorados para ganhar +1 opção de escolha.',
        descriptionEmperor: 'Consumir 2 Cartas em Branco para ganhar +3 opções de escolha no total.',
        icon: '💔',
        constellationPath: "M50,30 L65,60 L95,65 L75,90 L80,120 L50,105 L20,120 L25,90 L5,65 L35,60 Z"
    }
];

export const getActiveSynergies = (slots: CircleSlot[]): ActiveSynergy[] => {
    const activeCardIds = slots.map(getCardEffectId).filter(Boolean) as string[];
    const isEmpowered = activeCardIds.includes('THE_EMPEROR');
    const activeSynergies: ActiveSynergy[] = [];

    for (const synergy of SYNERGIES) {
        const hasCard1 = activeCardIds.includes(synergy.cards[0]);
        const hasCard2 = activeCardIds.includes(synergy.cards[1]);

        if (hasCard1 && hasCard2) {
            activeSynergies.push({ ...synergy, isEmpowered });
        }
    }
    return activeSynergies;
};
