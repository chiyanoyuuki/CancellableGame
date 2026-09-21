/**
 * « Donjons & Gorgées » — moteur pur et testable (aucun import React Native ni
 * contenu). Voir le cahier des charges : docs/DONJONS_ET_GORGEES.md.
 *
 * Le moteur gère la MÉCANIQUE RPG : personnages (race + classe → stats), ivresse
 * dynamique, jet de d20 contre un DC (avantage si bonne réponse, 1 = échec
 * critique, 20 = réussite critique), conséquences (gorgées / gage), XP et
 * montée de niveau, et la boucle de tour (rotation simple). Le CONTENU (texte
 * des questions, des gages…) reste externe : l'appelant fournit à `RESOLVE` si
 * la réponse était bonne, le moteur en déduit le reste.
 */
import type { CancelLevel, Player, PlayerSessionResult, SessionResult } from './models';
import { mulberry32, pick, type Rng } from './rng';

// ─────────────────────────────────────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────────────────────────────────────

export type Stat = 'savoir' | 'charisme' | 'perception' | 'descente' | 'adresse' | 'audace';
export const STATS: readonly Stat[] = ['savoir', 'charisme', 'perception', 'descente', 'adresse', 'audace'];

export const STAT_META: Record<Stat, { emoji: string; label: string }> = {
  savoir: { emoji: '🧠', label: 'Savoir' },
  charisme: { emoji: '😎', label: 'Charisme' },
  perception: { emoji: '👁️', label: 'Perception' },
  descente: { emoji: '🍺', label: 'Descente' },
  adresse: { emoji: '🤸', label: 'Adresse' },
  audace: { emoji: '🔥', label: 'Audace' },
};

export type StatBlock = Record<Stat, number>;

const zeroStats = (): StatBlock => ({ savoir: 0, charisme: 0, perception: 0, descente: 0, adresse: 0, audace: 0 });

/** Bornes d'une stat effective (évite les valeurs qui s'emballent). */
export const STAT_MIN = -5;
export const STAT_MAX = 8;
const clampStat = (n: number): number => Math.max(STAT_MIN, Math.min(STAT_MAX, n));

// ─────────────────────────────────────────────────────────────────────────────
// Races (chacune « possède » une stat) — cf. §9 du cahier des charges
// ─────────────────────────────────────────────────────────────────────────────

export type RaceId = 'nain' | 'elfe' | 'orc' | 'vampire' | 'gnome' | 'diablotin';

export interface Race {
  id: RaceId;
  name: string;
  emoji: string;
  mods: Partial<StatBlock>;
  trait: { name: string; desc: string };
}

export const RACES: readonly Race[] = [
  {
    id: 'nain', name: 'Nain', emoji: '🧔',
    mods: { descente: 2, audace: 1, charisme: -1 },
    trait: { name: 'Estomac de fer', desc: 'La 1re gorgée de chaque tour ne compte pas dans son ivresse.' },
  },
  {
    id: 'elfe', name: 'Elfe', emoji: '🧝',
    mods: { perception: 2, savoir: 1, descente: -1 },
    trait: { name: 'Œil de lynx', desc: 'Avantage sur tous les gages d’observation.' },
  },
  {
    id: 'orc', name: 'Orc', emoji: '🧌',
    mods: { adresse: 2, audace: 1, savoir: -2 },
    trait: { name: 'Berserk', desc: 'Relance un jet de défi physique/action par manche.' },
  },
  {
    id: 'vampire', name: 'Vampire', emoji: '🧛',
    mods: { charisme: 2, perception: 1, descente: -1 },
    trait: { name: 'Charme', desc: '1×/partie, force une Vérité sans jet.' },
  },
  {
    id: 'gnome', name: 'Gnome', emoji: '🔬',
    mods: { savoir: 2, perception: 1, adresse: -1 },
    trait: { name: 'Érudit', desc: 'Avantage sur un univers de quiz au choix.' },
  },
  {
    id: 'diablotin', name: 'Diablotin', emoji: '😈',
    mods: { audace: 2, charisme: 1, perception: -1 },
    trait: { name: 'Provocateur', desc: 'Les échecs de ses cibles sont aggravés d’un cran.' },
  },
];

export const RACE_BY_ID: Record<RaceId, Race> = Object.fromEntries(RACES.map((r) => [r.id, r])) as Record<RaceId, Race>;

// ─────────────────────────────────────────────────────────────────────────────
// Classes (rôle + capacité signature à coût) — cf. §10 du cahier des charges
// ─────────────────────────────────────────────────────────────────────────────

export type ClassId = 'barde' | 'guerrier' | 'voleur' | 'mage' | 'pretre' | 'rodeur';

export interface CharClass {
  id: ClassId;
  name: string;
  emoji: string;
  role: string;
  lean: Stat;
  mods: Partial<StatBlock>;
  /** Capacité signature, réutilisable mais « à coût » (1 gorgée par défaut). */
  ability: { name: string; desc: string; cost: string };
}

export const CLASSES: readonly CharClass[] = [
  {
    id: 'barde', name: 'Barde', emoji: '🎵', role: 'Soutien', lean: 'charisme',
    mods: { charisme: 2, perception: 1 },
    ability: { name: 'Sérénade', desc: 'Prend un défi à la place d’un allié, ou lui donne l’avantage.', cost: '1 gorgée' },
  },
  {
    id: 'guerrier', name: 'Guerrier', emoji: '🛡️', role: 'Tank', lean: 'descente',
    mods: { descente: 2, audace: 1 },
    ability: { name: 'Provocation', desc: 'Encaisse une conséquence à la place d’un autre, réduite d’un cran.', cost: '1 gorgée' },
  },
  {
    id: 'voleur', name: 'Voleur', emoji: '🗡️', role: 'Saboteur', lean: 'adresse',
    mods: { adresse: 2, audace: 1 },
    ability: { name: 'Sabotage', desc: 'Désavantage au prochain jet d’une cible, ou lui vole un objet.', cost: '1 gorgée' },
  },
  {
    id: 'mage', name: 'Mage', emoji: '🔮', role: 'Cerveau', lean: 'savoir',
    mods: { savoir: 2, perception: 1 },
    ability: { name: 'Illumination', desc: 'Transforme une question en QCM facilité / révèle un indice.', cost: '1 gorgée' },
  },
  {
    id: 'pretre', name: 'Prêtre', emoji: '⛪', role: 'Soigneur', lean: 'perception',
    mods: { perception: 2, charisme: 1 },
    ability: { name: 'Bénédiction', desc: 'Annule une gorgée/gage, ou baisse l’ivresse d’un allié.', cost: '1 gorgée' },
  },
  {
    id: 'rodeur', name: 'Rôdeur', emoji: '🏹', role: 'Dégâts', lean: 'audace',
    mods: { audace: 2, adresse: 1 },
    ability: { name: 'Visée', desc: 'Rend le défi d’une cible plus dur (+DC), ou double la casse sur un 1.', cost: '1 gorgée' },
  },
];

export const CLASS_BY_ID: Record<ClassId, CharClass> = Object.fromEntries(CLASSES.map((c) => [c.id, c])) as Record<ClassId, CharClass>;

// ─────────────────────────────────────────────────────────────────────────────
// Objets — cf. §11
// ─────────────────────────────────────────────────────────────────────────────

export type ItemId = 'bouclier' | 'miroir' | 'potion' | 'de_pipe' | 'antidote';

export interface Item {
  id: ItemId;
  name: string;
  emoji: string;
  desc: string;
}

export const ITEMS: readonly Item[] = [
  { id: 'bouclier', name: 'Bouclier', emoji: '🛡️', desc: 'Annule une conséquence (gorgée/gage).' },
  { id: 'miroir', name: 'Miroir', emoji: '🔮', desc: 'Renvoie le défi à l’attaquant.' },
  { id: 'potion', name: 'Potion', emoji: '🧪', desc: 'Avantage à ton prochain jet.' },
  { id: 'de_pipe', name: 'Dé pipé', emoji: '🎲', desc: 'Relance un jet.' },
  { id: 'antidote', name: 'Antidote', emoji: '💧', desc: '−1 palier d’ivresse.' },
];

export const ITEM_BY_ID: Record<ItemId, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i])) as Record<ItemId, Item>;

// ─────────────────────────────────────────────────────────────────────────────
// Personnage
// ─────────────────────────────────────────────────────────────────────────────

export interface Character {
  playerId: string;
  raceId: RaceId;
  classId: ClassId;
  /** Stats de base (race + classe + points de niveau dépensés), hors ivresse. */
  base: StatBlock;
  /** Gorgées cumulées de la partie (pilote l'ivresse). */
  gorgees: number;
  level: number;
  xp: number; // XP dans le niveau courant (0..XP_PER_LEVEL)
  pendingLevelUps: number; // montées de niveau à dépenser
  items: ItemId[];
}

/** Stats de base d'un couple race + classe (avant ivresse et niveaux). */
export function baseStatsFor(raceId: RaceId, classId: ClassId): StatBlock {
  const out = zeroStats();
  const apply = (mods: Partial<StatBlock>) => {
    for (const s of STATS) out[s] += mods[s] ?? 0;
  };
  apply(RACE_BY_ID[raceId].mods);
  apply(CLASS_BY_ID[classId].mods);
  return out;
}

/** Crée un personnage neuf pour un joueur. */
export function createCharacter(playerId: string, raceId: RaceId, classId: ClassId): Character {
  return {
    playerId,
    raceId,
    classId,
    base: baseStatsFor(raceId, classId),
    gorgees: 0,
    level: 1,
    xp: 0,
    pendingLevelUps: 0,
    items: [],
  };
}

/** Tire une race et une classe au hasard (doublons de classe autorisés). */
export function randomAssignment(rng: Rng): { raceId: RaceId; classId: ClassId } {
  return { raceId: pick(RACES, rng).id, classId: pick(CLASSES, rng).id };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ivresse — cf. §7
// ─────────────────────────────────────────────────────────────────────────────

export const IVRESSE_PALIER = 3; // gorgées par palier
const IVRESSE_DELTA: Partial<StatBlock> = { audace: 1, charisme: 1, perception: -1, savoir: -1 };

/** Nombre de paliers d'ivresse en cours. */
export function ivresseLevel(gorgees: number): number {
  return Math.floor(Math.max(0, gorgees) / IVRESSE_PALIER);
}

/** Stats EFFECTIVES : base + effet de l'ivresse (bornées). */
export function effectiveStats(c: Character): StatBlock {
  const paliers = ivresseLevel(c.gorgees);
  const out = { ...c.base };
  for (const s of STATS) out[s] = clampStat(out[s] + (IVRESSE_DELTA[s] ?? 0) * paliers);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dé & résolution — cf. §4
// ─────────────────────────────────────────────────────────────────────────────

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export interface RollResult {
  dice: number[]; // les d20 lancés (1 ou 2 selon le mode)
  natural: number; // le d20 retenu
  mod: number; // stat effective
  total: number; // natural + mod
  dc: number;
  success: boolean;
  crit: boolean; // 20 naturel
  fumble: boolean; // 1 naturel
  margin: number; // total - dc (négatif = raté)
}

const d20 = (rng: Rng): number => 1 + Math.floor(rng() * 20);

/** Lance le d20 selon le mode (avantage = 2 dés, garde le meilleur ; désavantage = le pire). */
export function rollD20(rng: Rng, mode: RollMode = 'normal'): { dice: number[]; natural: number } {
  if (mode === 'normal') {
    const n = d20(rng);
    return { dice: [n], natural: n };
  }
  const a = d20(rng);
  const b = d20(rng);
  const natural = mode === 'advantage' ? Math.max(a, b) : Math.min(a, b);
  return { dice: [a, b], natural };
}

/** Résout une action : d20 + stat ≥ DC. Le 20 réussit toujours, le 1 échoue toujours. */
export function resolve(rng: Rng, opts: { mod: number; dc: number; mode?: RollMode }): RollResult {
  const { dice, natural } = rollD20(rng, opts.mode ?? 'normal');
  const total = natural + opts.mod;
  const crit = natural === 20;
  const fumble = natural === 1;
  const success = crit ? true : fumble ? false : total >= opts.dc;
  return { dice, natural, mod: opts.mod, total, dc: opts.dc, success, crit, fumble, margin: total - opts.dc };
}

// DC selon la difficulté d'une question de culture (1..4).
export const DC = { easy: 8, medium: 12, hard: 15, brutal: 18 } as const;
export function dcForDifficulty(difficulty: 1 | 2 | 3 | 4): number {
  return ({ 1: 10, 2: 13, 3: 15, 4: 17 } as const)[difficulty];
}

// ─────────────────────────────────────────────────────────────────────────────
// Conséquences — cf. §6
// ─────────────────────────────────────────────────────────────────────────────

export const XP = { success: 10, crit: 20, braveFail: 3, gageDone: 5 } as const;
export const XP_PER_LEVEL = 30;

export type Consequence =
  | { kind: 'success'; xp: number; loot: boolean; canRefile: boolean }
  | { kind: 'fail'; severity: 'light' | 'heavy' | 'fumble'; sips: number; gageLevel: CancelLevel | null; xp: number };

/**
 * Déduit la conséquence d'un jet. `escalate` (trait Diablotin de l'attaquant)
 * aggrave un échec d'un cran. `cancelLevels` = niveaux Cancellable actifs, pour
 * choisir la sévérité d'un éventuel gage.
 */
export function consequenceFor(
  r: RollResult,
  opts: { cancelLevels: readonly CancelLevel[]; escalate?: boolean } = { cancelLevels: [1] },
): Consequence {
  const levels = opts.cancelLevels.length ? [...opts.cancelLevels].sort((a, b) => a - b) : [1];
  const maxLevel = levels[levels.length - 1] as CancelLevel;
  const midLevel = levels[Math.floor((levels.length - 1) / 2)] as CancelLevel;

  if (r.success) {
    return r.crit
      ? { kind: 'success', xp: XP.crit, loot: true, canRefile: true }
      : { kind: 'success', xp: XP.success, loot: false, canRefile: false };
  }

  // Échec : sévérité selon l'ampleur, aggravée d'un cran si escalate/fumble.
  let severity: 'light' | 'heavy' | 'fumble' = r.fumble ? 'fumble' : -r.margin >= 5 ? 'heavy' : 'light';
  if (opts.escalate && severity !== 'fumble') severity = severity === 'light' ? 'heavy' : 'fumble';

  if (severity === 'fumble') return { kind: 'fail', severity, sips: 1, gageLevel: maxLevel, xp: 0 };
  if (severity === 'heavy') return { kind: 'fail', severity, sips: 2, gageLevel: midLevel, xp: XP.braveFail };
  return { kind: 'fail', severity, sips: 1, gageLevel: null, xp: XP.braveFail };
}

// ─────────────────────────────────────────────────────────────────────────────
// Application aux personnages (fonctions pures : renvoient un NOUVEAU personnage)
// ─────────────────────────────────────────────────────────────────────────────

/** Ajoute des gorgées (respecte le trait « Estomac de fer » du Nain : 1 gorgée offerte par tour). */
export function drink(c: Character, sips: number, opts: { firstOfTurn?: boolean } = {}): Character {
  let effective = Math.max(0, sips);
  if (opts.firstOfTurn && c.raceId === 'nain' && effective > 0) effective -= 1; // estomac de fer
  return { ...c, gorgees: c.gorgees + effective };
}

/** Baisse l'ivresse d'un palier (eau / antidote). */
export function sober(c: Character, paliers = 1): Character {
  return { ...c, gorgees: Math.max(0, c.gorgees - paliers * IVRESSE_PALIER) };
}

/** Ajoute de l'XP et déclenche d'éventuelles montées de niveau (à dépenser ensuite). */
export function gainXp(c: Character, amount: number): Character {
  if (amount <= 0) return c;
  let xp = c.xp + amount;
  let level = c.level;
  let pending = c.pendingLevelUps;
  while (xp >= XP_PER_LEVEL) {
    xp -= XP_PER_LEVEL;
    level += 1;
    pending += 1;
  }
  return { ...c, xp, level, pendingLevelUps: pending };
}

/** Dépense une montée de niveau : +1 à une stat de base. */
export function spendLevelUp(c: Character, stat: Stat): Character {
  if (c.pendingLevelUps <= 0) return c;
  return { ...c, base: { ...c.base, [stat]: c.base[stat] + 1 }, pendingLevelUps: c.pendingLevelUps - 1 };
}

export function giveItem(c: Character, item: ItemId): Character {
  return { ...c, items: [...c.items, item] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Config & durées — cf. §2
// ─────────────────────────────────────────────────────────────────────────────

export type GameDuration = 'court' | 'normal' | 'long';

export interface DonjonsConfig {
  duration: GameDuration;
  drinksEnabled: boolean;
  /** Niveaux Cancellable actifs (pour la sévérité des gages). */
  cancelLevels: CancelLevel[];
}

/** Niveau à atteindre pour gagner selon la durée. */
export function targetLevel(duration: GameDuration): number {
  return ({ court: 3, normal: 5, long: 7 } as const)[duration];
}

/** Filet de sécurité : nb max de manches (tours par joueur) avant fin forcée. */
export function maxRounds(duration: GameDuration): number {
  return ({ court: 3, normal: 5, long: 8 } as const)[duration];
}

// ─────────────────────────────────────────────────────────────────────────────
// Cartes de défi — cf. §5
// ─────────────────────────────────────────────────────────────────────────────

export type CardType = 'question' | 'action' | 'verite' | 'jaijamais' | 'duel';

/** Stat testée par défaut pour chaque carte (le duel peut être surchargé). */
export const CARD_STAT: Record<CardType, Stat> = {
  question: 'savoir',
  action: 'audace',
  verite: 'charisme',
  jaijamais: 'charisme',
  duel: 'audace',
};

// ─────────────────────────────────────────────────────────────────────────────
// État & reducer (boucle de tour) — cf. §12
// ─────────────────────────────────────────────────────────────────────────────

export type DonjonsPhase = 'select' | 'resolve' | 'levelup' | 'finished';

export interface CurrentChallenge {
  attackerId: string;
  targetId: string;
  card: CardType;
  stat: Stat;
  dc: number;
}

export interface DonjonsState {
  config: DonjonsConfig;
  players: Player[];
  characters: Record<string, Character>;
  order: string[]; // ordre des tours (rotation simple)
  turnIndex: number; // index de l'attaquant courant dans `order`
  round: number; // nb de tours complets effectués (+1 quand on repasse au 1er)
  phase: DonjonsPhase;
  current: CurrentChallenge | null;
  lastRoll: RollResult | null;
  lastConsequence: Consequence | null;
  seed: number;
  rngCursor: number; // nb de tirages déjà consommés (rejoue la séquence, garde la pureté)
  winnerId: string | null;
}

export type DonjonsAction =
  | { type: 'CHOOSE'; targetId: string; card: CardType; difficulty?: 1 | 2 | 3 | 4; stat?: Stat }
  | { type: 'RESOLVE'; answerCorrect?: boolean; mode?: RollMode; gageDone?: boolean }
  | { type: 'SPEND_LEVELUP'; stat: Stat }
  | { type: 'NEXT' };

/** Reconstruit un RNG positionné après `cursor` tirages (garde le reducer pur). */
function rngAt(seed: number, cursor: number): Rng {
  const rng = mulberry32(seed >>> 0);
  for (let i = 0; i < cursor; i += 1) rng();
  return rng;
}

export function createDonjonsState(args: {
  config: DonjonsConfig;
  players: Player[];
  /** Assignations race/classe par joueur ; les manquantes sont tirées au hasard. */
  assignments?: Record<string, { raceId: RaceId; classId: ClassId }>;
  seed: number;
  order?: string[];
}): DonjonsState {
  const seed = args.seed >>> 0;
  const rng = mulberry32(seed);
  let cursor = 0;
  const characters: Record<string, Character> = {};
  for (const p of args.players) {
    const a = args.assignments?.[p.id];
    if (a) {
      characters[p.id] = createCharacter(p.id, a.raceId, a.classId);
    } else {
      const raceId = pick(RACES, rng).id;
      const classId = pick(CLASSES, rng).id;
      cursor += 2; // deux tirages consommés
      characters[p.id] = createCharacter(p.id, raceId, classId);
    }
  }
  const order = args.order ?? args.players.map((p) => p.id);
  return {
    config: args.config,
    players: args.players,
    characters,
    order,
    turnIndex: 0,
    round: 0,
    phase: order.length >= 2 ? 'select' : 'finished',
    current: null,
    lastRoll: null,
    lastConsequence: null,
    seed,
    rngCursor: cursor,
    winnerId: null,
  };
}

const activeId = (s: DonjonsState): string => s.order[s.turnIndex] as string;

/** Classement : niveau décroissant, puis XP, puis moins de gorgées. */
export function donjonsRanking(s: DonjonsState): string[] {
  return [...s.order].sort((a, b) => {
    const ca = s.characters[a] as Character;
    const cb = s.characters[b] as Character;
    return cb.level - ca.level || cb.xp - ca.xp || ca.gorgees - cb.gorgees;
  });
}

/** XP totale cumulée d'un personnage (sert de score / classement). */
export function totalScore(c: Character): number {
  return (c.level - 1) * XP_PER_LEVEL + c.xp;
}

/** Convertit l'état final en résultat de session (pour les stats de l'app). */
export function donjonsToSessionResult(state: DonjonsState, startedAt: number, endedAt: number): SessionResult {
  const ranked = donjonsRanking(state);
  let lastScore: number | null = null;
  let lastRank = 0;
  const players: PlayerSessionResult[] = ranked.map((id, i) => {
    const c = state.characters[id] as Character;
    const points = totalScore(c);
    const rank = lastScore !== null && points === lastScore ? lastRank : i + 1;
    lastScore = points;
    lastRank = rank;
    return {
      playerId: id,
      points,
      rank,
      sipsDrunk: c.gorgees,
      sipsGiven: 0,
      details: { level: c.level, raceId: c.raceId, classId: c.classId },
    };
  });
  return { gameId: 'donjons', mode: 'rpg', config: { ...state.config }, startedAt, endedAt, players };
}

export function donjonsReducer(state: DonjonsState, action: DonjonsAction): DonjonsState {
  if (state.phase === 'finished') return state;

  switch (action.type) {
    case 'CHOOSE': {
      if (state.phase !== 'select') return state;
      const attackerId = activeId(state);
      if (action.targetId === attackerId || !state.characters[action.targetId]) return state;
      const stat = action.card === 'duel' ? action.stat ?? CARD_STAT.duel : CARD_STAT[action.card];
      const dc = action.card === 'question' ? dcForDifficulty(action.difficulty ?? 2) : DC.medium;
      return {
        ...state,
        phase: 'resolve',
        current: { attackerId, targetId: action.targetId, card: action.card, stat, dc },
      };
    }

    case 'RESOLVE': {
      if (state.phase !== 'resolve' || !state.current) return state;
      const { attackerId, targetId, card, stat, dc } = state.current;
      const attacker = state.characters[attackerId] as Character;
      const target = state.characters[targetId] as Character;

      // Mode du jet : bonne réponse = avantage, mauvaise = désavantage (question) ;
      // sinon `mode` fourni (objet potion, capacité…) ou normal.
      let mode: RollMode = action.mode ?? 'normal';
      if (card === 'question' && action.answerCorrect !== undefined) {
        mode = action.answerCorrect ? 'advantage' : 'disadvantage';
      }

      const rng = rngAt(state.seed, state.rngCursor);
      let cursor = state.rngCursor;
      const draws = mode === 'normal' ? 1 : 2;

      const characters = { ...state.characters };

      if (card === 'duel') {
        // Jets opposés : l'attaquant et la cible lancent sur la même stat, le plus haut gagne.
        const rA = resolve(rng, { mod: effectiveStats(attacker)[stat], dc: 0, mode });
        const rB = resolve(rng, { mod: effectiveStats(target)[stat], dc: 0, mode: 'normal' });
        cursor += draws + 1;
        const targetWins = rB.total >= rA.total; // égalité en faveur du défenseur
        const winnerId = targetWins ? targetId : attackerId;
        const loserId = targetWins ? attackerId : targetId;
        const winnerRoll = targetWins ? rB : rA;
        const loserRoll = targetWins ? rA : rB;
        // Le perdant subit un échec « franc » (pire encore sur un 1 naturel).
        const cons = consequenceFor(
          { ...loserRoll, success: false, crit: false, dc: 0, margin: -5 },
          { cancelLevels: state.config.cancelLevels },
        );
        let loser = characters[loserId] as Character;
        if (cons.kind === 'fail' && state.config.drinksEnabled && cons.sips > 0) loser = drink(loser, cons.sips, { firstOfTurn: true });
        loser = gainXp(loser, cons.kind === 'fail' ? cons.xp : 0);
        characters[loserId] = loser;
        characters[winnerId] = gainXp(characters[winnerId] as Character, XP.success);
        const anyPending = Object.values(characters).some((c) => c.pendingLevelUps > 0);
        return {
          ...state,
          phase: anyPending ? 'levelup' : 'resolve',
          characters,
          lastRoll: winnerRoll,
          lastConsequence: cons,
          rngCursor: cursor,
          current: { ...state.current },
        };
      }

      const roll = resolve(rng, { mod: effectiveStats(target)[stat], dc, mode });
      cursor += draws;
      const escalate = attacker.raceId === 'diablotin';
      const cons = consequenceFor(roll, { cancelLevels: state.config.cancelLevels, escalate });

      let updated = target;
      if (cons.kind === 'success') {
        updated = gainXp(updated, cons.xp);
        if (cons.loot) {
          const item = pick(ITEMS, rng).id;
          cursor += 1;
          updated = giveItem(updated, item);
        }
      } else {
        if (state.config.drinksEnabled && cons.sips > 0) updated = drink(updated, cons.sips, { firstOfTurn: true });
        const xp = cons.xp + (action.gageDone ? XP.gageDone : 0);
        updated = gainXp(updated, xp);
      }
      characters[targetId] = updated;

      const anyPending = Object.values(characters).some((c) => c.pendingLevelUps > 0);
      return { ...state, phase: anyPending ? 'levelup' : 'resolve', characters, lastRoll: roll, lastConsequence: cons, rngCursor: cursor };
    }

    case 'SPEND_LEVELUP': {
      if (state.phase !== 'levelup') return state;
      // Dépense pour le joueur qui a des montées en attente (cible ou perdant du duel).
      const pendingId = Object.keys(state.characters).find((id) => (state.characters[id] as Character).pendingLevelUps > 0);
      if (!pendingId) return { ...state, phase: 'resolve' };
      const updated = spendLevelUp(state.characters[pendingId] as Character, action.stat);
      const characters = { ...state.characters, [pendingId]: updated };
      const stillPending = Object.values(characters).some((c) => c.pendingLevelUps > 0);
      return { ...state, characters, phase: stillPending ? 'levelup' : 'resolve' };
    }

    case 'NEXT': {
      if (state.phase !== 'resolve') return state;
      // Condition de victoire : un joueur a atteint le niveau cible.
      const target = targetLevel(state.config.duration);
      const reached = state.order.find((id) => (state.characters[id] as Character).level >= target);
      if (reached) {
        return { ...state, phase: 'finished', winnerId: reached, current: null };
      }
      // Rotation simple.
      const nextIndex = (state.turnIndex + 1) % state.order.length;
      const round = nextIndex === 0 ? state.round + 1 : state.round;
      if (round >= maxRounds(state.config.duration)) {
        const winnerId = donjonsRanking(state)[0] as string;
        return { ...state, phase: 'finished', winnerId, current: null, round };
      }
      return { ...state, turnIndex: nextIndex, round, phase: 'select', current: null, lastRoll: null, lastConsequence: null };
    }

    default:
      return state;
  }
}
