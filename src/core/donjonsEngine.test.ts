import {
  addPending,
  baseStatsFor,
  CLASS_BY_ID,
  combineMode,
  consequenceFor,
  createCharacter,
  createDonjonsState,
  type Character,
  DC,
  dcForDifficulty,
  donjonsRanking,
  donjonsReducer,
  donjonsToSessionResult,
  drink,
  effectiveStats,
  gainXp,
  ivresseLevel,
  maxRounds,
  RACE_BY_ID,
  resolve,
  rollD20,
  type RollResult,
  sober,
  spendLevelUp,
  type Stat,
  STATS,
  targetLevel,
  traitMode,
  XP_PER_LEVEL,
  type DonjonsConfig,
  type DonjonsState,
} from './donjonsEngine';
import type { Player } from './models';

// RNG factices déterministes -------------------------------------------------
const constRng = (v: number) => () => v; // d20 = 1 + floor(v*20)
const seqRng = (...vals: number[]) => {
  let i = 0;
  return () => vals[i++ % vals.length] as number;
};

const players: Player[] = [
  { id: 'p1', name: 'A', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'B', emoji: '🐼', color: '#0f0' },
  { id: 'p3', name: 'C', emoji: '🐸', color: '#00f' },
];

const cfg = (over: Partial<DonjonsConfig> = {}): DonjonsConfig => ({
  duration: 'normal',
  drinksEnabled: true,
  cancelLevels: [1, 2, 3, 4],
  ...over,
});

const assignments = {
  p1: { raceId: 'nain', classId: 'guerrier' } as const,
  p2: { raceId: 'gnome', classId: 'mage' } as const,
  p3: { raceId: 'elfe', classId: 'rodeur' } as const,
};

const create = (over: Partial<DonjonsConfig> = {}) =>
  createDonjonsState({ config: cfg(over), players, assignments, seed: 42 });

const rr = (over: Partial<RollResult> = {}): RollResult => ({
  dice: [10], natural: 10, mod: 0, total: 10, dc: 10, success: true, crit: false, fumble: false, margin: 0, ...over,
});

describe('donjonsEngine — stats & personnages', () => {
  it('baseStatsFor additionne race + classe', () => {
    // Nain (descente+2, audace+1, charisme-1) + Guerrier (descente+2, audace+1)
    const s = baseStatsFor('nain', 'guerrier');
    expect(s.descente).toBe(4);
    expect(s.audace).toBe(2);
    expect(s.charisme).toBe(-1);
    expect(s.savoir).toBe(0);
  });

  it('createCharacter démarre niveau 1, 0 XP, 0 gorgée', () => {
    const c = createCharacter('p1', 'elfe', 'mage');
    expect(c.level).toBe(1);
    expect(c.xp).toBe(0);
    expect(c.gorgees).toBe(0);
    expect(c.base).toEqual(baseStatsFor('elfe', 'mage'));
  });

  it('chaque race possède bien une stat dominante distincte', () => {
    expect(RACE_BY_ID.nain.mods.descente).toBeGreaterThan(0);
    expect(RACE_BY_ID.gnome.mods.savoir).toBeGreaterThan(0);
    expect(CLASS_BY_ID.mage.lean).toBe('savoir');
  });
});

describe('donjonsEngine — ivresse', () => {
  it('ivresseLevel = 1 palier tous les 3 gorgées', () => {
    expect(ivresseLevel(0)).toBe(0);
    expect(ivresseLevel(2)).toBe(0);
    expect(ivresseLevel(3)).toBe(1);
    expect(ivresseLevel(7)).toBe(2);
  });

  it('l’ivresse déforme les stats : +Audace/+Charisme, −Perception/−Savoir', () => {
    const c = { ...createCharacter('p1', 'gnome', 'mage'), gorgees: 6 }; // 2 paliers
    const base = createCharacter('p1', 'gnome', 'mage').base;
    const eff = effectiveStats(c);
    expect(eff.audace).toBe(base.audace + 2);
    expect(eff.charisme).toBe(base.charisme + 2);
    expect(eff.perception).toBe(base.perception - 2);
    expect(eff.savoir).toBe(base.savoir - 2);
  });
});

describe('donjonsEngine — dé & résolution', () => {
  it('rollD20 avantage garde le meilleur, désavantage le pire', () => {
    expect(rollD20(seqRng(0, 0.9999), 'advantage').natural).toBe(20);
    expect(rollD20(seqRng(0, 0.9999), 'disadvantage').natural).toBe(1);
    expect(rollD20(constRng(0.5), 'normal')).toEqual({ dice: [11], natural: 11 });
  });

  it('le 1 naturel échoue toujours, le 20 réussit toujours', () => {
    const fumble = resolve(constRng(0), { mod: 100, dc: 5 });
    expect(fumble.natural).toBe(1);
    expect(fumble.fumble).toBe(true);
    expect(fumble.success).toBe(false); // même avec +100

    const crit = resolve(constRng(0.9999), { mod: -100, dc: 5 });
    expect(crit.natural).toBe(20);
    expect(crit.crit).toBe(true);
    expect(crit.success).toBe(true); // même avec −100
  });

  it('réussite standard = d20 + stat ≥ DC', () => {
    expect(resolve(constRng(0.5), { mod: 0, dc: 11 }).success).toBe(true); // 11 ≥ 11
    expect(resolve(constRng(0.5), { mod: 0, dc: 12 }).success).toBe(false); // 11 < 12
  });

  it('DC croît avec la difficulté d’une question', () => {
    expect(dcForDifficulty(1)).toBeLessThan(dcForDifficulty(4));
    expect(DC.easy).toBeLessThan(DC.brutal);
  });
});

describe('donjonsEngine — conséquences', () => {
  it('réussite critique = loot + XP max', () => {
    const c = consequenceFor(rr({ success: true, crit: true, natural: 20 }));
    expect(c.kind).toBe('success');
    if (c.kind === 'success') {
      expect(c.loot).toBe(true);
      expect(c.xp).toBe(20);
    }
  });

  it('échec léger = 1 gorgée, échec franc = 2 gorgées + gage', () => {
    const light = consequenceFor(rr({ success: false, margin: -2 }));
    const heavy = consequenceFor(rr({ success: false, margin: -6 }));
    expect(light).toMatchObject({ kind: 'fail', severity: 'light', sips: 1, gageLevel: null });
    expect(heavy).toMatchObject({ kind: 'fail', severity: 'heavy', sips: 2 });
    if (heavy.kind === 'fail') expect(heavy.gageLevel).not.toBeNull();
  });

  it('1 naturel = pire conséquence (gage au niveau max)', () => {
    const f = consequenceFor(rr({ success: false, fumble: true, natural: 1, margin: -1 }), { cancelLevels: [1, 2, 3, 4] });
    expect(f).toMatchObject({ kind: 'fail', severity: 'fumble' });
    if (f.kind === 'fail') expect(f.gageLevel).toBe(4);
  });

  it('trait Provocateur (Diablotin) aggrave l’échec d’un cran', () => {
    const normal = consequenceFor(rr({ success: false, margin: -2 }));
    const escalated = consequenceFor(rr({ success: false, margin: -2 }), { cancelLevels: [1], escalate: true });
    expect(normal.kind === 'fail' && normal.severity).toBe('light');
    expect(escalated.kind === 'fail' && escalated.severity).toBe('heavy');
  });
});

describe('donjonsEngine — gorgées, XP & niveaux', () => {
  it('drink respecte l’Estomac de fer du Nain (1 gorgée offerte au 1er verre du tour)', () => {
    const nain = createCharacter('p1', 'nain', 'guerrier');
    const other = createCharacter('p2', 'elfe', 'mage');
    expect(drink(nain, 2, { firstOfTurn: true }).gorgees).toBe(1);
    expect(drink(other, 2, { firstOfTurn: true }).gorgees).toBe(2);
  });

  it('sober fait redescendre d’un palier', () => {
    const c = { ...createCharacter('p1', 'nain', 'guerrier'), gorgees: 7 };
    expect(sober(c).gorgees).toBe(4);
  });

  it('gainXp fait monter de niveau et empile les points à dépenser', () => {
    const c = gainXp(createCharacter('p1', 'nain', 'guerrier'), 2 * XP_PER_LEVEL + 5);
    expect(c.level).toBe(3);
    expect(c.xp).toBe(5);
    expect(c.pendingLevelUps).toBe(2);
  });

  it('spendLevelUp ajoute +1 à une stat et décrémente les points', () => {
    let c = gainXp(createCharacter('p1', 'nain', 'guerrier'), XP_PER_LEVEL);
    const before = c.base.savoir;
    c = spendLevelUp(c, 'savoir');
    expect(c.base.savoir).toBe(before + 1);
    expect(c.pendingLevelUps).toBe(0);
  });

  it('durée → niveau cible et plafond de manches', () => {
    expect(targetLevel('court')).toBeLessThan(targetLevel('long'));
    expect(maxRounds('court')).toBeLessThan(maxRounds('long'));
  });
});

describe('donjonsEngine — reducer (boucle de tour)', () => {
  it('démarre en select avec le 1er joueur actif', () => {
    const s = create();
    expect(s.phase).toBe('select');
    expect(s.order[s.turnIndex]).toBe('p1');
    expect(Object.keys(s.characters)).toHaveLength(3);
  });

  it('CHOOSE puis RESOLVE d’une question : avantage si bonne réponse (2 dés)', () => {
    let s = create();
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'question', difficulty: 2 });
    expect(s.phase).toBe('resolve');
    expect(s.current?.stat).toBe('savoir');
    s = donjonsReducer(s, { type: 'RESOLVE', answerCorrect: true });
    expect(s.lastRoll?.dice).toHaveLength(2); // avantage
    expect(['resolve', 'levelup']).toContain(s.phase);
    expect(s.lastConsequence).not.toBeNull();
  });

  it('on ne peut pas se cibler soi-même', () => {
    let s = create();
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p1', card: 'question' });
    expect(s.phase).toBe('select'); // ignoré
    expect(s.current).toBeNull();
  });

  it('un duel produit un perdant (conséquence fail) et de l’XP au vainqueur', () => {
    let s = create();
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'duel', stat: 'audace' });
    s = donjonsReducer(s, { type: 'RESOLVE' });
    expect(s.lastConsequence?.kind).toBe('fail');
    const totalXp = (s.characters.p1?.xp ?? 0) + (s.characters.p2?.xp ?? 0) + (s.characters.p1?.level ?? 1) + (s.characters.p2?.level ?? 1);
    expect(totalXp).toBeGreaterThan(2); // au moins un a progressé
  });

  it('NEXT tourne au joueur suivant (rotation simple)', () => {
    let s = create();
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'action' });
    s = donjonsReducer(s, { type: 'RESOLVE' });
    if (s.phase === 'levelup') s = donjonsReducer(s, { type: 'SPEND_LEVELUP', stat: 'audace' });
    s = donjonsReducer(s, { type: 'NEXT' });
    expect(s.phase).toBe('select');
    expect(s.order[s.turnIndex]).toBe('p2');
  });

  it('victoire quand un joueur atteint le niveau cible', () => {
    const s0 = create({ duration: 'court' }); // cible niveau 3
    const boosted: DonjonsState = {
      ...s0,
      phase: 'resolve',
      characters: { ...s0.characters, p2: { ...(s0.characters.p2 as NonNullable<typeof s0.characters.p2>), level: targetLevel('court') } },
    };
    const s = donjonsReducer(boosted, { type: 'NEXT' });
    expect(s.phase).toBe('finished');
    expect(s.winnerId).toBe('p2');
  });

  it('le mode déterministe : même seed → même résolution', () => {
    const run = () => {
      let s = create();
      s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'question', difficulty: 3 });
      s = donjonsReducer(s, { type: 'RESOLVE', answerCorrect: false });
      return s.lastRoll;
    };
    expect(run()).toEqual(run());
  });

  it('classement trie par niveau puis XP', () => {
    const s0 = create();
    const s: DonjonsState = {
      ...s0,
      characters: {
        ...s0.characters,
        p1: { ...(s0.characters.p1 as NonNullable<typeof s0.characters.p1>), level: 2, xp: 0 },
        p2: { ...(s0.characters.p2 as NonNullable<typeof s0.characters.p2>), level: 3, xp: 0 },
        p3: { ...(s0.characters.p3 as NonNullable<typeof s0.characters.p3>), level: 2, xp: 20 },
      },
    };
    expect(donjonsRanking(s)).toEqual(['p2', 'p3', 'p1']);
  });

  it('mode sans alcool : un échec ne fait pas boire', () => {
    let s = create({ drinksEnabled: false });
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'question', difficulty: 4 });
    s = donjonsReducer(s, { type: 'RESOLVE', answerCorrect: false });
    expect(s.characters.p2?.gorgees).toBe(0);
  });

  it('donjonsToSessionResult reflète le classement et les gorgées', () => {
    const s0 = create();
    const s: DonjonsState = {
      ...s0,
      characters: {
        ...s0.characters,
        p1: { ...(s0.characters.p1 as NonNullable<typeof s0.characters.p1>), level: 2, xp: 10, gorgees: 6 },
        p2: { ...(s0.characters.p2 as NonNullable<typeof s0.characters.p2>), level: 3, xp: 0 },
      },
    };
    const res = donjonsToSessionResult(s, 1000, 2000);
    expect(res.gameId).toBe('donjons');
    expect(res.players[0]?.playerId).toBe('p2'); // niveau le plus haut = 1er
    expect(res.players[0]?.rank).toBe(1);
    const p1 = res.players.find((p) => p.playerId === 'p1');
    expect(p1?.sipsDrunk).toBe(6);
  });
});

describe('donjonsEngine — cohérence des données', () => {
  it('toutes les stats des races/classes sont des stats connues', () => {
    const known = new Set<Stat>(STATS);
    for (const r of Object.values(RACE_BY_ID)) for (const k of Object.keys(r.mods)) expect(known.has(k as Stat)).toBe(true);
    for (const c of Object.values(CLASS_BY_ID)) for (const k of Object.keys(c.mods)) expect(known.has(k as Stat)).toBe(true);
  });
});

// ─── Phase 4 : traits, objets, capacités, duel ───
const mkState = (
  a1: { raceId: Parameters<typeof createCharacter>[1]; classId: Parameters<typeof createCharacter>[2] },
  a2: typeof a1,
  a3: typeof a1,
  over: Partial<DonjonsConfig> = {},
) =>
  createDonjonsState({ config: cfg(over), players, assignments: { p1: a1, p2: a2, p3: a3 }, seed: 42 });

const inject = (s: DonjonsState, id: string, patch: Partial<Character>): DonjonsState => ({
  ...s,
  characters: { ...s.characters, [id]: { ...(s.characters[id] as Character), ...patch } },
});

describe('donjonsEngine — Phase 4', () => {
  it('combineMode : avantage + désavantage = normal', () => {
    expect(combineMode('advantage', 'disadvantage')).toBe('normal');
    expect(combineMode('advantage', 'normal')).toBe('advantage');
    expect(combineMode('disadvantage', 'disadvantage')).toBe('disadvantage');
  });

  it('traitMode : Elfe avantage en Perception, Gnome avantage sur Question', () => {
    expect(traitMode(createCharacter('p', 'elfe', 'barde'), 'perception', 'action')).toBe('advantage');
    expect(traitMode(createCharacter('p', 'gnome', 'mage'), 'savoir', 'question')).toBe('advantage');
    expect(traitMode(createCharacter('p', 'elfe', 'barde'), 'savoir', 'question')).toBe('normal');
  });

  it('addPending cumule le DC et combine les modes', () => {
    let c = createCharacter('p', 'nain', 'guerrier');
    c = addPending(c, 'advantage', 2);
    c = addPending(c, 'disadvantage', 3);
    expect(c.pending?.mode).toBe('normal'); // avantage + désavantage s'annulent
    expect(c.pending?.dcDelta).toBe(5);
  });

  it('Gnome : une mauvaise réponse (désavantage) annulée par Érudit → jet normal (1 dé)', () => {
    // p2 = gnome/mage
    let s = create();
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'question', difficulty: 2 });
    s = donjonsReducer(s, { type: 'RESOLVE', answerCorrect: false });
    expect(s.lastRoll?.dice).toHaveLength(1);
  });

  it('USE_ITEM potion : avantage au prochain jet, consommé après', () => {
    let s = inject(create(), 'p2', { items: ['potion'] });
    s = donjonsReducer(s, { type: 'USE_ITEM', userId: 'p2', itemId: 'potion' });
    expect(s.characters.p2?.pending?.mode).toBe('advantage');
    expect(s.characters.p2?.items).toHaveLength(0);
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'action' });
    s = donjonsReducer(s, { type: 'RESOLVE' });
    expect(s.lastRoll?.dice).toHaveLength(2); // avantage appliqué
    expect(s.characters.p2?.pending).toBeUndefined(); // consommé
  });

  it('USE_ITEM antidote : dégrise d’un palier', () => {
    let s = inject(create(), 'p2', { items: ['antidote'], gorgees: 6 });
    s = donjonsReducer(s, { type: 'USE_ITEM', userId: 'p2', itemId: 'antidote' });
    expect(s.characters.p2?.gorgees).toBe(3);
  });

  it('USE_ITEM bouclier : la cible ne boit jamais sur ce jet (quel que soit le tirage)', () => {
    for (let seed = 1; seed <= 12; seed += 1) {
      let s = createDonjonsState({ config: cfg(), players, assignments, seed });
      s = inject(s, 'p2', { items: ['bouclier'] });
      s = donjonsReducer(s, { type: 'USE_ITEM', userId: 'p2', itemId: 'bouclier' });
      s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'question', difficulty: 4 });
      s = donjonsReducer(s, { type: 'RESOLVE', answerCorrect: false });
      expect(s.characters.p2?.gorgees).toBe(0);
    }
  });

  it('USE_ITEM miroir : renvoie le défi (inverse attaquant/cible)', () => {
    let s = inject(create(), 'p2', { items: ['miroir'] });
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'action' });
    s = donjonsReducer(s, { type: 'USE_ITEM', userId: 'p2', itemId: 'miroir' });
    expect(s.current?.targetId).toBe('p1');
    expect(s.current?.attackerId).toBe('p2');
  });

  it('USE_ABILITY Guerrier : bouclier sur soi + coût d’une gorgée', () => {
    let s = create(); // p1 = nain/guerrier, actif
    s = donjonsReducer(s, { type: 'USE_ABILITY', userId: 'p1' });
    expect(s.characters.p1?.shield).toBe(true);
    expect(s.characters.p1?.gorgees).toBe(1); // coût
  });

  it('USE_ABILITY Voleur : désavantage sur une cible', () => {
    let s = mkState({ raceId: 'orc', classId: 'voleur' }, { raceId: 'gnome', classId: 'mage' }, { raceId: 'elfe', classId: 'rodeur' });
    s = donjonsReducer(s, { type: 'USE_ABILITY', userId: 'p1', targetId: 'p2' });
    expect(s.characters.p2?.pending?.mode).toBe('disadvantage');
    expect(s.characters.p1?.gorgees).toBe(1);
  });

  it('USE_TRAIT Charme du Vampire : réussite auto sur une Vérité, sans jet, 1×/partie', () => {
    let s = mkState({ raceId: 'nain', classId: 'guerrier' }, { raceId: 'vampire', classId: 'barde' }, { raceId: 'elfe', classId: 'rodeur' });
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'verite' });
    const before = s.characters.p2?.level ?? 1;
    s = donjonsReducer(s, { type: 'USE_TRAIT', userId: 'p2' });
    expect(s.lastRoll).toBeNull();
    expect(s.lastConsequence?.kind).toBe('success');
    expect(s.characters.p2?.charmeUsed).toBe(true);
    // XP gagnée
    expect((s.characters.p2?.level ?? 1) * 30 + (s.characters.p2?.xp ?? 0)).toBeGreaterThan((before - 1) * 30);
  });

  it('USE_TRAIT Berserk de l’Orc : avantage (1×/manche)', () => {
    let s = mkState({ raceId: 'nain', classId: 'guerrier' }, { raceId: 'orc', classId: 'voleur' }, { raceId: 'elfe', classId: 'rodeur' });
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'action' });
    s = donjonsReducer(s, { type: 'USE_TRAIT', userId: 'p2' });
    expect(s.characters.p2?.pending?.mode).toBe('advantage');
    expect(s.characters.p2?.berserkRound).toBe(s.round);
    // 2e usage la même manche : sans effet
    const s2 = donjonsReducer(s, { type: 'USE_TRAIT', userId: 'p2' });
    expect(s2).toBe(s);
  });

  it('duel : lastDuel expose vainqueur et perdant', () => {
    let s = create();
    s = donjonsReducer(s, { type: 'CHOOSE', targetId: 'p2', card: 'duel', stat: 'audace' });
    s = donjonsReducer(s, { type: 'RESOLVE' });
    expect(s.lastDuel).not.toBeNull();
    expect([s.lastDuel?.winnerId, s.lastDuel?.loserId].sort()).toEqual(['p1', 'p2']);
  });
});
