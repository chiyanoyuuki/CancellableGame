import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Chip, PlayerAvatar, SectionHeader, Txt } from '../../components/ui';
import {
  type Character,
  CLASSES,
  CLASS_BY_ID,
  createDonjonsState,
  type DonjonsState,
  donjonsReducer,
  donjonsRanking,
  donjonsToSessionResult,
  ITEM_BY_ID,
  ivresseLevel,
  RACES,
  RACE_BY_ID,
  type CardType,
  type ClassId,
  type ItemId,
  type RaceId,
  STATS,
  STAT_META,
  totalScore,
} from '../../core/donjonsEngine';
import type { Player, Question } from '../../core/models';
import { mulberry32, randomSeed, shuffle } from '../../core/rng';
import { haptics } from '../../lib/haptics';
import { useT } from '../../lib/i18nProvider';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGamePlayProps } from '../types';
import { getQuizPool } from '../quiz/pool';
import { availableUniverses, drawChallenge, type DrawnChallenge } from './content';
import type { DonjonsPlayConfig } from './DonjonsConfig';

const CARD_LABEL: Record<CardType, string> = {
  question: '📚 Question',
  action: '🎭 Action',
  verite: '💬 Vérité',
  jaijamais: '🙊 J’ai jamais',
  duel: '⚔️ Duel',
};

export function DonjonsPlayComponent({ players, config, onFinish, onQuit }: MiniGamePlayProps) {
  const t = useT();
  const cfg = config as DonjonsPlayConfig;
  const levels = cfg.cancelLevels;
  const dareCategory = cfg.drinksEnabled ? ('alcool' as const) : ('soft' as const);

  const byId = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])) as Record<string, Player>, [players]);
  const contentRng = useRef(mulberry32(randomSeed())).current;
  const startedAtRef = useRef(Date.now());
  const finishedRef = useRef(false);

  // ─── Pool de questions (filtré niveaux + sélection de contenu) ───
  const [pool, setPool] = useState<Question[]>([]);
  useEffect(() => {
    let alive = true;
    void getQuizPool({ levels })
      .then((all) => {
        if (!alive) return;
        const themes = new Set(cfg.content.themes);
        const excluded = new Set(cfg.content.excludedUniverses);
        setPool(
          all.filter(
            (q) => (themes.size === 0 || themes.has(q.theme)) && !(q.universe ? excluded.has(q.universe) : false),
          ),
        );
      })
      .catch(() => setPool([]));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Création des personnages ───
  const [assign, setAssign] = useState<Record<string, { raceId: RaceId; classId: ClassId }>>({});
  const [creationIdx, setCreationIdx] = useState(0);
  const [game, setGame] = useState<DonjonsState | null>(null);

  // ─── Sélection du tour ───
  const [targetId, setTargetId] = useState<string | null>(null);
  const [card, setCard] = useState<CardType | null>(null);
  const [universe, setUniverse] = useState<string | undefined>(undefined);
  const [drawn, setDrawn] = useState<DrawnChallenge | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const resetTurn = () => {
    setTargetId(null);
    setCard(null);
    setUniverse(undefined);
    setDrawn(null);
    setOptions([]);
    setChosen(null);
    setRevealed(false);
  };

  // Fin de partie → on remonte le résultat une seule fois.
  useEffect(() => {
    if (game?.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(donjonsToSessionResult(game, startedAtRef.current, Date.now()));
    }
  }, [game?.phase, game, onFinish]);

  const universes = useMemo(() => availableUniverses(pool, levels), [pool, levels]);

  // ── Helpers de rendu ──
  const charLine = (c: Character) => {
    const r = RACE_BY_ID[c.raceId];
    const k = CLASS_BY_ID[c.classId];
    const ivr = ivresseLevel(c.gorgees);
    return `${r.emoji} ${r.name} ${k.emoji} ${k.name} · Niv.${c.level} · 🍺${c.gorgees}${ivr > 0 ? ` 🥴×${ivr}` : ''}`;
  };

  // ───────────────────────────── CRÉATION ─────────────────────────────
  if (!game) {
    const p = players[creationIdx] as Player;
    const cur = assign[p.id];
    const rollRandom = () => {
      const raceId = RACES[Math.floor(contentRng() * RACES.length)]!.id;
      const classId = CLASSES[Math.floor(contentRng() * CLASSES.length)]!.id;
      setAssign((a) => ({ ...a, [p.id]: { raceId, classId } }));
      haptics.tick();
    };
    const setRace = (raceId: RaceId) => setAssign((a) => ({ ...a, [p.id]: { raceId, classId: a[p.id]?.classId ?? CLASSES[0]!.id } }));
    const setClass = (classId: ClassId) => setAssign((a) => ({ ...a, [p.id]: { raceId: a[p.id]?.raceId ?? RACES[0]!.id, classId } }));
    const canValidate = !!cur;
    const isLast = creationIdx >= players.length - 1;

    const startGame = (finalAssign: Record<string, { raceId: RaceId; classId: ClassId }>) => {
      setGame(createDonjonsState({ config: cfg, players, assignments: finalAssign, seed: randomSeed() }));
      resetTurn();
    };

    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <SectionHeader title={t('Création — {name}', { name: p.name })} />
          <Card accent={p.color}>
            <View style={styles.rowCenter}>
              <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} playerId={p.id} size={48} />
              <Txt weight="800" style={{ marginLeft: spacing(1) }}>
                {p.name}
              </Txt>
            </View>
          </Card>

          <SectionHeader title={t('Race')} />
          <View style={styles.wrap}>
            {RACES.map((r) => (
              <Chip key={r.id} label={`${r.emoji} ${r.name}`} selected={cur?.raceId === r.id} onPress={() => setRace(r.id)} />
            ))}
          </View>
          {cur && (
            <Txt faint size={fontSize.xs}>
              {RACE_BY_ID[cur.raceId].trait.name} — {RACE_BY_ID[cur.raceId].trait.desc}
            </Txt>
          )}

          <SectionHeader title={t('Classe')} />
          <View style={styles.wrap}>
            {CLASSES.map((k) => (
              <Chip key={k.id} label={`${k.emoji} ${k.name}`} selected={cur?.classId === k.id} onPress={() => setClass(k.id)} />
            ))}
          </View>
          {cur && (
            <Txt faint size={fontSize.xs}>
              {CLASS_BY_ID[cur.classId].ability.name} — {CLASS_BY_ID[cur.classId].ability.desc} ({CLASS_BY_ID[cur.classId].ability.cost})
            </Txt>
          )}

          <View style={{ height: spacing(1) }} />
          <View style={styles.row}>
            <Button title={t('🎲 Aléatoire')} variant="secondary" size="sm" onPress={rollRandom} />
            <Button
              title={t('🎲 Tout aléatoire')}
              variant="secondary"
              size="sm"
              onPress={() => {
                const full: Record<string, { raceId: RaceId; classId: ClassId }> = { ...assign };
                for (const pl of players) {
                  if (!full[pl.id])
                    full[pl.id] = {
                      raceId: RACES[Math.floor(contentRng() * RACES.length)]!.id,
                      classId: CLASSES[Math.floor(contentRng() * CLASSES.length)]!.id,
                    };
                }
                startGame(full);
              }}
            />
          </View>
          <View style={{ height: spacing(0.5) }} />
          <Button
            title={isLast ? t('Commencer l’aventure') : t('Joueur suivant')}
            emoji={isLast ? '⚔️' : '➡️'}
            size="lg"
            variant="accent"
            disabled={!canValidate}
            onPress={() => {
              if (isLast) startGame(assign);
              else setCreationIdx((i) => i + 1);
            }}
          />
          <Button title={t('Quitter')} variant="ghost" size="sm" onPress={onQuit} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ───────────────────────────── FIN ─────────────────────────────
  if (game.phase === 'finished') {
    const ranking = donjonsRanking(game);
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <SectionHeader title={t('🏆 Fin de l’aventure')} />
          {ranking.map((id, i) => {
            const p = byId[id] as Player;
            const c = game.characters[id] as Character;
            return (
              <Card key={id} accent={i === 0 ? colors.accent : undefined}>
                <View style={styles.rowBetween}>
                  <View style={styles.rowCenter}>
                    <Txt weight="800" style={{ width: 28 }}>{`${i + 1}.`}</Txt>
                    <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} playerId={p.id} size={36} />
                    <View style={{ marginLeft: spacing(1) }}>
                      <Txt weight="700">{p.name}</Txt>
                      <Txt faint size={fontSize.xs}>{charLine(c)}</Txt>
                    </View>
                  </View>
                  <Txt weight="800">{`${totalScore(c)} XP`}</Txt>
                </View>
              </Card>
            );
          })}
          <View style={{ height: spacing(1) }} />
          <Button title={t('Terminer')} size="lg" variant="accent" onPress={onQuit} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const active = game.characters[game.order[game.turnIndex] as string] as Character;
  const activePlayer = byId[active.playerId] as Player;
  const others = players.filter((p) => p.id !== active.playerId);

  const dispatch = (action: Parameters<typeof donjonsReducer>[1]) => setGame((s) => (s ? donjonsReducer(s, action) : s));

  // ───────────────────────────── LEVEL UP ─────────────────────────────
  if (game.phase === 'levelup') {
    const pendingId = Object.keys(game.characters).find((id) => (game.characters[id] as Character).pendingLevelUps > 0);
    const pc = pendingId ? (game.characters[pendingId] as Character) : null;
    const pp = pendingId ? (byId[pendingId] as Player) : null;
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <SectionHeader title={t('⬆️ Montée de niveau !')} />
          {pc && pp && (
            <>
              <Card accent={pp.color}>
                <Txt weight="800">{t('{name} passe niveau {lvl} !', { name: pp.name, lvl: pc.level })}</Txt>
                <Txt faint size={fontSize.xs}>{t('Choisis une stat à améliorer (+1).')}</Txt>
              </Card>
              <View style={styles.wrap}>
                {STATS.map((s) => (
                  <Chip
                    key={s}
                    label={`${STAT_META[s].emoji} ${STAT_META[s].label} (${pc.base[s] >= 0 ? '+' : ''}${pc.base[s]})`}
                    onPress={() => {
                      dispatch({ type: 'SPEND_LEVELUP', stat: s });
                      haptics.tick();
                    }}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ───────────────────────────── SELECT ─────────────────────────────
  if (game.phase === 'select') {
    const canQuestion = pool.length > 0;
    const confirm = () => {
      if (!targetId || !card) return;
      const d = drawChallenge(card, { levels, quizPool: pool, universe, dareCategory }, contentRng);
      if (!d) return; // ex. question sans contenu : on laisse rechoisir
      setDrawn(d);
      if (d.card === 'question') {
        setOptions(shuffle([d.question.answer, ...d.question.distractors], contentRng));
        setChosen(null);
      }
      dispatch({ type: 'CHOOSE', targetId, card, difficulty: d.card === 'question' ? d.difficulty : undefined });
    };
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Card accent={activePlayer.color}>
            <View style={styles.rowCenter}>
              <PlayerAvatar emoji={activePlayer.emoji} color={activePlayer.color} photoUri={activePlayer.photoUri} playerId={activePlayer.id} size={44} />
              <View style={{ marginLeft: spacing(1), flex: 1 }}>
                <Txt weight="800">{t('Au tour de {name}', { name: activePlayer.name })}</Txt>
                <Txt faint size={fontSize.xs}>{charLine(active)}</Txt>
              </View>
            </View>
          </Card>

          <SectionHeader title={t('Cible ta victime')} />
          <View style={styles.wrap}>
            {others.map((p) => (
              <Chip key={p.id} label={`${p.emoji} ${p.name}`} selected={targetId === p.id} onPress={() => setTargetId(p.id)} color={p.color} />
            ))}
          </View>

          <SectionHeader title={t('Type de défi')} />
          <View style={styles.wrap}>
            {(Object.keys(CARD_LABEL) as CardType[]).map((c) => {
              const cardDisabled = c === 'question' && !canQuestion;
              return (
                <Chip
                  key={c}
                  label={CARD_LABEL[c]}
                  selected={card === c}
                  onPress={cardDisabled ? undefined : () => setCard(c)}
                />
              );
            })}
          </View>
          {card === 'question' && !canQuestion && (
            <Txt faint size={fontSize.xs}>{t('Chargement des questions…')}</Txt>
          )}

          {card === 'question' && canQuestion && (
            <>
              <SectionHeader title={t('Univers')} />
              <View style={styles.wrap}>
                <Chip label={t('🎲 Au hasard')} selected={universe === undefined} onPress={() => setUniverse(undefined)} />
                {universes.slice(0, 40).map((u) => (
                  <Chip key={u} label={u} selected={universe === u} onPress={() => setUniverse(u)} />
                ))}
              </View>
            </>
          )}

          <View style={{ height: spacing(1) }} />
          <Button
            title={t('Lancer le défi')}
            emoji="🎯"
            size="lg"
            variant="accent"
            disabled={!targetId || !card || (card === 'question' && !canQuestion)}
            onPress={confirm}
          />
          <Button title={t('Quitter')} variant="ghost" size="sm" onPress={onQuit} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ───────────────────────────── RESOLVE ─────────────────────────────
  const cur = game.current;
  const targetChar = cur ? (game.characters[cur.targetId] as Character) : null;
  const targetPlayer = cur ? (byId[cur.targetId] as Player) : null;

  const doResolve = () => {
    if (!drawn) return;
    if (drawn.card === 'question') {
      dispatch({ type: 'RESOLVE', answerCorrect: chosen !== null && chosen === drawn.question.answer });
    } else if (drawn.card === 'duel') {
      dispatch({ type: 'RESOLVE' });
    } else {
      dispatch({ type: 'RESOLVE', gageDone: true });
    }
    setRevealed(true);
    haptics.tick();
  };

  // Coups de pouce (objets, capacités, traits activés).
  const useItem = (userId: string, itemId: ItemId) => {
    dispatch({ type: 'USE_ITEM', userId, itemId });
    haptics.tick();
  };
  const useAbility = (userId: string, tId?: string) => {
    dispatch({ type: 'USE_ABILITY', userId, targetId: tId });
    haptics.tick();
  };
  const useCharme = () => {
    if (!cur) return;
    dispatch({ type: 'USE_TRAIT', userId: cur.targetId });
    setRevealed(true);
    haptics.tick();
  };
  const useBerserk = () => {
    if (!cur) return;
    dispatch({ type: 'USE_TRAIT', userId: cur.targetId });
    haptics.tick();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {targetPlayer && cur && (
          <Card accent={targetPlayer.color}>
            <Txt weight="800">
              {CARD_LABEL[cur.card]} · {t('pour {name}', { name: targetPlayer.name })}
            </Txt>
            <Txt faint size={fontSize.xs}>
              {t('Test de {stat} — DC {dc}', { stat: STAT_META[cur.stat].label, dc: cur.dc })}
            </Txt>
          </Card>
        )}

        {/* Contenu du défi */}
        {drawn?.card === 'question' && (
          <>
            <Card>
              <Txt weight="700">{drawn.question.text}</Txt>
            </Card>
            <View style={{ gap: spacing(0.75), marginTop: spacing(1) }}>
              {options.map((opt) => {
                const isAnswer = opt === drawn.question.answer;
                const picked = chosen === opt;
                const showColor = revealed ? (isAnswer ? colors.success : picked ? colors.danger : undefined) : picked ? colors.accent : undefined;
                return (
                  <Button
                    key={opt}
                    title={opt}
                    variant="secondary"
                    onPress={revealed ? undefined : () => setChosen(opt)}
                    style={showColor ? { borderColor: showColor, borderWidth: 2 } : undefined}
                  />
                );
              })}
            </View>
          </>
        )}
        {drawn && drawn.card !== 'question' && drawn.card !== 'duel' && (
          <Card>
            <Txt weight="700">{drawn.text}</Txt>
          </Card>
        )}
        {drawn?.card === 'duel' && cur && (
          <Card>
            <Txt weight="700">{t('⚔️ Duel de {stat} !', { stat: STAT_META[cur.stat].label })}</Txt>
            <Txt faint size={fontSize.xs}>{t('{a} défie {b} : le plus haut jet l’emporte.', { a: activePlayer.name, b: targetPlayer?.name ?? '' })}</Txt>
          </Card>
        )}

        {/* Coups de pouce : objets, capacités, traits activés (avant le jet) */}
        {!revealed && cur && targetChar && (
          <Card>
            <Txt faint size={fontSize.xs}>{t('Coups de pouce')}</Txt>
            {targetChar.items.length > 0 && (
              <View style={[styles.wrap, { marginTop: spacing(0.5) }]}>
                {targetChar.items.map((it, i) => (
                  <Chip key={`${it}-${i}`} label={`${ITEM_BY_ID[it].emoji} ${ITEM_BY_ID[it].name}`} onPress={() => useItem(cur.targetId, it)} />
                ))}
              </View>
            )}
            <View style={[styles.wrap, { marginTop: spacing(0.5) }]}>
              {(active.classId === 'voleur' || active.classId === 'rodeur') && (
                <Chip
                  label={`${CLASS_BY_ID[active.classId].emoji} ${CLASS_BY_ID[active.classId].ability.name}`}
                  onPress={() => useAbility(active.playerId, cur.targetId)}
                />
              )}
              {(targetChar.classId === 'guerrier' || targetChar.classId === 'mage' || targetChar.classId === 'barde' || targetChar.classId === 'pretre') && (
                <Chip
                  label={`${CLASS_BY_ID[targetChar.classId].emoji} ${CLASS_BY_ID[targetChar.classId].ability.name}`}
                  onPress={() => useAbility(cur.targetId, targetChar.classId === 'guerrier' ? undefined : cur.targetId)}
                />
              )}
              {targetChar.raceId === 'vampire' && cur.card === 'verite' && !targetChar.charmeUsed && (
                <Chip label={t('🧛 Charme')} onPress={useCharme} />
              )}
              {targetChar.raceId === 'orc' && (cur.card === 'action' || cur.card === 'duel') && targetChar.berserkRound !== game.round && (
                <Chip label={t('🧌 Berserk')} onPress={useBerserk} />
              )}
            </View>
          </Card>
        )}

        {/* Résultat */}
        {revealed && (game.lastRoll || game.lastConsequence) && (
          <Card accent={game.lastRoll?.crit ? colors.success : game.lastRoll?.fumble ? colors.danger : undefined}>
            {game.lastDuel ? (
              <Txt weight="800" size={fontSize.lg}>
                {t('🏆 {w} l’emporte sur {l} !', { w: byId[game.lastDuel.winnerId]?.name ?? '', l: byId[game.lastDuel.loserId]?.name ?? '' })}
              </Txt>
            ) : game.lastRoll ? (
              <>
                <Txt weight="800" size={fontSize.lg}>
                  {game.lastRoll.crit ? '🎉 20 — Réussite critique !' : game.lastRoll.fumble ? '💀 1 — Échec critique !' : `🎲 ${game.lastRoll.natural} + ${game.lastRoll.mod} = ${game.lastRoll.total}`}
                </Txt>
                <Txt faint size={fontSize.xs}>
                  {game.lastRoll.success ? t('Réussite (DC {dc}) ✅', { dc: game.lastRoll.dc }) : t('Échec (DC {dc}) ❌', { dc: game.lastRoll.dc })}
                </Txt>
              </>
            ) : (
              <Txt weight="800" size={fontSize.lg}>{t('✨ Charme du Vampire — réussite auto !')}</Txt>
            )}
            {game.lastConsequence && (
              <Txt style={{ marginTop: spacing(0.5) }}>
                {game.lastConsequence.kind === 'success'
                  ? t('+{xp} XP{loot}', { xp: game.lastConsequence.xp, loot: game.lastConsequence.loot ? ' · 🎁 objet !' : '' })
                  : cfg.drinksEnabled
                    ? t('🍺 {n} gorgée(s){gage}', { n: game.lastConsequence.sips, gage: game.lastConsequence.gageLevel ? ' + gage' : '' })
                    : t('Gage à réaliser !')}
              </Txt>
            )}
          </Card>
        )}

        <View style={{ height: spacing(1) }} />
        {!revealed ? (
          <Button
            title={drawn?.card === 'duel' ? t('Lancer les dés') : drawn?.card === 'question' ? t('Valider et lancer le d20') : t('Lancer le d20')}
            emoji="🎲"
            size="lg"
            variant="accent"
            disabled={drawn?.card === 'question' && chosen === null}
            onPress={doResolve}
          />
        ) : (
          <Button
            title={t('Continuer')}
            emoji="➡️"
            size="lg"
            variant="accent"
            onPress={() => {
              dispatch({ type: 'NEXT' });
              resetTurn();
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(2), gap: spacing(1), paddingBottom: spacing(4) },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  row: { flexDirection: 'row', gap: spacing(1) },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
