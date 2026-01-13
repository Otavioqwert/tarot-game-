import { CircleSlot, CardInstance } from './types';
import { TAROT_LIBRARY } from './constants';

export interface Synergy {
  id: string;
  name: string;
  cards: [string, string];
  description: string;
  descriptionEmperor: string;
  icon: string;
  constellationPath: string;
  tags: string[];
}

export interface ActiveSynergy extends Synergy {
  isEmpowered: boolean;
}

const getCardEffectId = (slot: CircleSlot): string | null => {
  const instance: CardInstance | null = slot.card || null;
  if (!instance) return null;
  const cardData = TAROT_LIBRARY.find(c => c.id === instance.cardId);
  return cardData?.effectId || null;
};

export const SYNERGIES: Synergy[] = [
  {
    id: 'FOOL_WORLD',
    name: 'Jornada do Herói',
    cards: ['THE_FOOL', 'THE_WORLD'],
    description: '+3% de ganho de recursos/ciclo entre os ciclos 6–18 do dia.',
    descriptionEmperor: '+3.75% de ganho de recursos/ciclo entre os ciclos 6–18.',
    icon: '🌀',
    tags: ['+3% ciclo', '6h–18h', 'Escala c/ Imperador'],
    constellationPath: 'M10,80 Q50,10 90,80 T170,80',
  },
  {
    id: 'MAGICIAN_PRIESTESS',
    name: 'Ritual Arcano',
    cards: ['THE_MAGICIAN', 'THE_HIGH_PRIESTESS'],
    description: 'Efeitos puramente passivos ativam 1 vez extra a cada ciclo.',
    descriptionEmperor: 'Passivos ganham ~30% mais valor nessa ativação extra.',
    icon: '🔮',
    tags: ['Passivos x2', 'Magia contínua'],
    constellationPath: 'M20,20 L80,80 M80,20 L20,80',
  },
  {
    id: 'EMPRESS_EMPEROR',
    name: 'Império',
    cards: ['THE_EMPRESS', 'THE_EMPEROR'],
    description: 'Adiciona +1 slot ao Círculo enquanto ambos estiverem presentes.',
    descriptionEmperor: 'Mesmo efeito; já empoderado por definição.',
    icon: '👑',
    tags: ['+1 slot', 'Círculo expandido'],
    constellationPath: 'M50,10 L90,50 L50,90 L10,50 Z',
  },
  {
    id: 'HIEROPHANT_HERMIT',
    name: 'Retiro Sagrado',
    cards: ['THE_HIEROPHANT', 'THE_HERMIT'],
    description: 'Anula efeitos deles. Gera 0.5 recurso/s fixos.',
    descriptionEmperor: 'Anula efeitos. Gera 0.625 recurso/s fixos.',
    icon: '📜',
    tags: ['0.5/s fixo', 'Efeitos anulados'],
    constellationPath: 'M30,70 Q50,50 70,70 Q90,90 70,110',
  },
  {
    id: 'WHEEL_JUDGEMENT',
    name: 'Karma Infinito',
    cards: ['WHEEL_OF_FORTUNE', 'JUDGEMENT'],
    description: 'Cancela a penalidade de redução do Julgamento nos adjacentes.',
    descriptionEmperor: 'Igual, com abertura para boosters externos de Sync (1/4).',
    icon: '⚖️',
    tags: ['Sem penalidade', 'Wheel + Judge'],
    constellationPath: 'M50,20 C80,20 80,80 50,80 C20,80 20,20 50,20 Z',
  },
  {
    id: 'DEATH_TOWER',
    name: 'Colapso Controlado',
    cards: ['DEATH', 'THE_TOWER'],
    description: 'Death não pode consumir The Tower. Torre tem 50% chance de Arcano Maior.',
    descriptionEmperor: 'Chance de Arcano Maior da Torre sobe para 62.5%.',
    icon: '💥',
    tags: ['Tower segura', '50% Arcano'],
    constellationPath: 'M10,10 L90,90 M50,10 L50,90 M10,50 L90,50',
  },
  {
    id: 'SUN_MOON',
    name: 'Eclipse Eterno',
    cards: ['THE_SUN', 'THE_MOON'],
    description: 'Dia e noite têm mesmo comportamento; anula penalidade da Lua (-25 alcance lunar).',
    descriptionEmperor: 'Redução de alcance lunar cai para -20.',
    icon: '🌗',
    tags: ['Dia=Noite', 'Lua suave'],
    constellationPath: 'M30,50 A20,20 0 1,1 70,50 A20,20 0 1,1 30,50',
  },
  {
    id: 'LOVERS_BLANK',
    name: 'Eco do Vazio',
    cards: ['THE_LOVERS', 'BLANK'],
    description: 'Cada blank consumida ao ativar Lovers gera +1 escolha.',
    descriptionEmperor: 'Consumir 2 blanks concede +3 escolhas totais.',
    icon: '💔',
    tags: ['Mais escolhas', 'Consome blank'],
    constellationPath: 'M50,30 L65,60 L95,65 L75,90 L80,120 L50,105 L20,120 L25,90 L5,65 L35,60 Z',
  },
];

export const getActiveSynergies = (slots: CircleSlot[]): ActiveSynergy[] => {
  const activeEffectIds = slots
    .map(getCardEffectId)
    .filter((id): id is string => Boolean(id));

  const isEmpowered = activeEffectIds.includes('THE_EMPEROR');

  const active: ActiveSynergy[] = [];

  for (const synergy of SYNERGIES) {
    const [a, b] = synergy.cards;
    if (activeEffectIds.includes(a) && activeEffectIds.includes(b)) {
      active.push({ ...synergy, isEmpowered });
    }
  }

  return active;
};
