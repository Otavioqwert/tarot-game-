
import { Card, SyncType } from './types';

export const TICK_RATE = 30000; // 30 segundos tempo real = 1 hora no jogo
export const DAILY_MAX = 24;
export const LUNAR_MAX = 168; // 7 dias * 24 horas
export const SIGN_MAX = 672;  // 28 dias * 24 horas (Tempo de 1 signo)

export const DAY_START = 6;
export const DAY_END = 17;

export const LUNAR_PHASES = [
  { name: 'Nova', icon: '🌑' },
  { name: 'Crescente', icon: '🌓' },
  { name: 'Cheia', icon: '🌕' },
  { name: 'Minguante', icon: '🌗' }
];

export const ZODIAC_SIGNS = [
  { name: 'Áries', icon: '♈' }, { name: 'Touro', icon: '♉' }, { name: 'Gêmeos', icon: '♊' },
  { name: 'Câncer', icon: '♋' }, { name: 'Leão', icon: '♌' }, { name: 'Virgem', icon: '♍' },
  { name: 'Libra', icon: '♎' }, { name: 'Escorpião', icon: '♏' }, { name: 'Sagitário', icon: '♐' },
  { name: 'Capricórnio', icon: '♑' }, { name: 'Aquário', icon: '♒' }, { name: 'Peixes', icon: '♓' }
];

const IMG_BASE_URL = 'https://www.sacred-texts.com/tarot/pkt/img/';

export const BLANK_CARD_DATA: Card = {
  id: -1,
  name: 'Carta em Branco',
  effect: 'Herda marcas de sua origem. Pode ser substituída por qualquer outra carta.',
  syncValue: 0, syncType: SyncType.ELEMENT, syncBonus: 0,
  element: 'spirit', imageUrl: 'about:blank', // No image
  effectId: 'BLANK'
};


export const TAROT_LIBRARY: Card[] = [
  { id: 0, name: 'O Louco', effect: 'Volta 24 ciclos, uso único. Os 12 ciclos seguintes duram +30s. (Acumulativo)', syncValue: 10, syncType: SyncType.ELEMENT, syncBonus: 5, element: 'spirit', imageUrl: `${IMG_BASE_URL}ar00.jpg`, marks: [{ type: 'sign', name: 'Aquário', icon: ZODIAC_SIGNS[10].icon }], effectId: 'THE_FOOL' },
  { id: 1, name: 'O Mago', effect: 'Dobra todos os efeitos numéricos da carta à direita.', syncValue: 15, syncType: SyncType.ELEMENT, syncBonus: 10, element: 'fire', imageUrl: `${IMG_BASE_URL}ar01.jpg`, marks: [{ type: 'sign', name: 'Gêmeos', icon: ZODIAC_SIGNS[2].icon }], effectId: 'THE_MAGICIAN' },
  { id: 2, name: 'A Sacerdotisa', effect: 'Avança 168 ciclos. Cooldown de 168 ciclos.', syncValue: 20, syncType: SyncType.LUNAR, syncBonus: 15, element: 'water', imageUrl: `${IMG_BASE_URL}ar02.jpg`, marks: [{ type: 'lunar', name: 'Nova', icon: LUNAR_PHASES[0].icon }], effectId: 'THE_HIGH_PRIESTESS' },
  { id: 3, name: 'A Imperatriz', effect: 'Copia efeito e estado da carta à direita, mantendo marcas próprias.', syncValue: 12, syncType: SyncType.SIGN, syncBonus: 8, element: 'earth', imageUrl: `${IMG_BASE_URL}ar03.jpg`, marks: [{ type: 'sign', name: 'Touro', icon: ZODIAC_SIGNS[1].icon }], effectId: 'THE_EMPRESS' },
  { id: 4, name: 'O Imperador', effect: 'Aumenta em 25% efeitos de sinergia.', syncValue: 18, syncType: SyncType.ELEMENT, syncBonus: 12, element: 'fire', imageUrl: `${IMG_BASE_URL}ar04.jpg`, marks: [{ type: 'sign', name: 'Áries', icon: ZODIAC_SIGNS[0].icon }], effectId: 'THE_EMPEROR' },
  { id: 5, name: 'O Hierofante', effect: 'Ganha até 0.3 recursos * Sync². Valor depende da Sincronia.', syncValue: 14, syncType: SyncType.SIGN, syncBonus: 9, element: 'earth', imageUrl: `${IMG_BASE_URL}ar05.jpg`, marks: [{ type: 'sign', name: 'Sagitário', icon: ZODIAC_SIGNS[8].icon }], effectId: 'THE_HIEROPHANT' },
  { id: 6, name: 'Os Enamorados', effect: 'Escolha entre 2 cartas. Deixa uma carta em branco para trás herdando marcas.', syncValue: 25, syncType: SyncType.ELEMENT, syncBonus: 20, element: 'air', imageUrl: `${IMG_BASE_URL}ar06.jpg`, marks: [{ type: 'sign', name: 'Gêmeos', icon: ZODIAC_SIGNS[2].icon }], effectId: 'THE_LOVERS' },
  { id: 7, name: 'O Carro', effect: 'Reduz 1 ciclo/dy. 10% chance de reduzir 2 ciclos de cooldown do círculo.', syncValue: 17, syncType: SyncType.ELEMENT, syncBonus: 11, element: 'fire', imageUrl: `${IMG_BASE_URL}ar07.jpg`, marks: [{ type: 'sign', name: 'Câncer', icon: ZODIAC_SIGNS[3].icon }], effectId: 'THE_CHARIOT' },
  { id: 8, name: 'A Força', effect: '+1 soma numérica para o efeito principal das cartas adjacentes.', syncValue: 19, syncType: SyncType.ELEMENT, syncBonus: 13, element: 'fire', imageUrl: `${IMG_BASE_URL}ar08.jpg`, marks: [{ type: 'sign', name: 'Leão', icon: ZODIAC_SIGNS[4].icon }], effectId: 'STRENGTH' },
  { id: 9, name: 'O Eremita', effect: 'Ganha 5 recursos por ciclo para cada espaço vazio no Círculo.', syncValue: 16, syncType: SyncType.SIGN, syncBonus: 10, element: 'earth', imageUrl: `${IMG_BASE_URL}ar09.jpg`, marks: [{ type: 'sign', name: 'Virgem', icon: ZODIAC_SIGNS[5].icon }], effectId: 'THE_HERMIT' },
  { id: 10, name: 'Roda da Fortuna', effect: 'Aumenta efeito das cartas em 50% * Sync se marcas ativas.', syncValue: 30, syncType: SyncType.SIGN, syncBonus: 25, element: 'fire', imageUrl: `${IMG_BASE_URL}ar10.jpg`, marks: [{ type: 'sign', name: 'Sagitário', icon: ZODIAC_SIGNS[8].icon }], effectId: 'WHEEL_OF_FORTUNE' },
  { id: 11, name: 'A Justiça', effect: '+1% Sync e 25 recursos a cada 7 ciclos. Reset a cada 168 ciclos.', syncValue: 21, syncType: SyncType.ELEMENT, syncBonus: 14, element: 'air', imageUrl: `${IMG_BASE_URL}ar11.jpg`, marks: [{ type: 'sign', name: 'Libra', icon: ZODIAC_SIGNS[6].icon }], effectId: 'JUSTICE' },
  { id: 12, name: 'O Enforcado', effect: 'Abre altar de sacrifício. Receba ((n+1)n/2)*50 Aether após 1 Lua. Cooldown de 1 Lua.', syncValue: 13, syncType: SyncType.LUNAR, syncBonus: 16, element: 'water', imageUrl: `${IMG_BASE_URL}ar12.jpg`, marks: [{ type: 'sign', name: 'Peixes', icon: ZODIAC_SIGNS[11].icon }], effectId: 'THE_HANGED_MAN' },
  { id: 13, name: 'A Morte', effect: 'Na Lua, consome carta à esquerda e transforma outra em Morte (herda marcas).', syncValue: 5, syncType: SyncType.LUNAR, syncBonus: 40, element: 'water', imageUrl: `${IMG_BASE_URL}ar13.jpg`, marks: [{ type: 'sign', name: 'Escorpião', icon: ZODIAC_SIGNS[7].icon }], effectId: 'DEATH' },
  { id: 14, name: 'A Temperança', 'effect': 'Converte numerais para 2 dígitos e equaliza valores do Círculo em pares.', syncValue: 23, syncType: SyncType.SIGN, syncBonus: 17, element: 'air', imageUrl: `${IMG_BASE_URL}ar14.jpg`, marks: [{ type: 'lunar', name: 'Crescente', icon: LUNAR_PHASES[1].icon }], effectId: 'TEMPERANCE' },
  { id: 15, name: 'O Diabo', effect: 'Consome marcas por recompensas e maldições (Isolada, Volátil, Temporal).', syncValue: 24, syncType: SyncType.ELEMENT, syncBonus: 18, element: 'earth', imageUrl: `${IMG_BASE_URL}ar15.jpg`, marks: [{ type: 'sign', name: 'Capricórnio', icon: ZODIAC_SIGNS[9].icon }], effectId: 'THE_DEVIL' },
  { id: 16, name: 'A Torre', effect: 'Reorganiza a cada 8 ciclos. 15% chance de executar TODOS os efeitos.', syncValue: 8, syncType: SyncType.ELEMENT, syncBonus: 30, element: 'fire', imageUrl: `${IMG_BASE_URL}ar16.jpg`, marks: [{ type: 'lunar', name: 'Minguante', icon: LUNAR_PHASES[3].icon }], effectId: 'THE_TOWER' },
  { id: 17, name: 'A Estrela', effect: '+20% Sync base. +30% por marca para cartas com "sync". Penaliza desvios.', syncValue: 22, syncType: SyncType.SIGN, syncBonus: 18, element: 'air', imageUrl: `${IMG_BASE_URL}ar17.jpg`, marks: [{ type: 'sign', name: 'Aquário', icon: ZODIAC_SIGNS[10].icon }], effectId: 'THE_STAR' },
  { id: 18, name: 'A Lua', effect: 'Lua contribui 100%, Signo 30%. Reduz efeitos diretos de Sync em 40%.', syncValue: 28, syncType: SyncType.LUNAR, syncBonus: 22, element: 'water', imageUrl: `${IMG_BASE_URL}ar18.jpg`, marks: [{ type: 'lunar', name: 'Cheia', icon: LUNAR_PHASES[2].icon }], effectId: 'THE_MOON' },
  { id: 19, name: 'O Sol', effect: 'Dia (6-17) ativa marcas de Lua. Ciclo 12 multiplica efeitos por 4.', syncValue: 28, syncType: SyncType.ELEMENT, syncBonus: 22, element: 'fire', imageUrl: `${IMG_BASE_URL}ar19.jpg`, marks: [{ type: 'sign', name: 'Leão', icon: ZODIAC_SIGNS[4].icon }], effectId: 'THE_SUN' },
  { id: 20, name: 'O Julgamento', effect: 'Replica 50% dos efeitos adjacentes, mas reduz alvos em 25%.', syncValue: 26, syncType: SyncType.LUNAR, syncBonus: 20, element: 'spirit', imageUrl: `${IMG_BASE_URL}ar20.jpg`, marks: [{ type: 'lunar', name: 'Crescente', icon: LUNAR_PHASES[1].icon }], effectId: 'JUDGEMENT' },
  { id: 21, name: 'O Mundo', effect: 'Cooldown 2 Luas. 999 Aether. +100% efeitos (24h), +300% sync-cards (12h).', syncValue: 35, syncType: SyncType.SIGN, syncBonus: 30, element: 'spirit', imageUrl: `${IMG_BASE_URL}ar21.jpg`, marks: [{ type: 'sign', name: 'Capricórnio', icon: ZODIAC_SIGNS[9].icon }], effectId: 'THE_WORLD' },
];

export const KF_A1 = "11L";
export const KF_D8 = "48I";