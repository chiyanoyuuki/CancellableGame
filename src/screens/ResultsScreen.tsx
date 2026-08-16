import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { AchievementTrackCard } from '../components/AchievementTrackCard';
import { Button, Card, PlayerAvatar, Screen, Txt } from '../components/ui';
import { achievementScore, playerAchievements, type TrackProgress } from '../core/achievements';
import type { Player, PlayerSessionResult } from '../core/models';
import { loadStatAnswers, loadStatResults } from '../db';
import { getGame } from '../games/registry';
import { haptics } from '../lib/haptics';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { colors, fontSize, radius, RANK_MEDALS, spacing } from '../theme/theme';

export function ResultsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Results'>) {
  const { result, players } = route.params;
  const { ent } = useStore();

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  // Resolve display info for either a real player or a team (from its details).
  const disp = (r: PlayerSessionResult) => {
    const p = byId[r.playerId];
    const d = (r.details ?? {}) as { name?: string; emoji?: string; color?: string; members?: { name: string; emoji: string }[] };
    return {
      name: p?.name ?? d.name ?? r.playerId,
      emoji: p?.emoji ?? d.emoji ?? '🏳️',
      color: p?.color ?? d.color ?? colors.primary,
      members: d.members,
    };
  };

  const ranked = useMemo(() => [...result.players].sort((a, b) => a.rank - b.rank), [result.players]);
  const winner = ranked[0] ? disp(ranked[0]) : undefined;

  // Petite salve de vibration festive à l'affichage des résultats.
  useEffect(() => {
    haptics.win();
  }, []);

  // Hauts faits AVANT / APRÈS cette partie, pour montrer la progression réalisée
  // à l'instant (la partie est déjà enregistrée quand on arrive ici).
  const [after, setAfter] = useState<Record<string, TrackProgress[]>>({});
  const [before, setBefore] = useState<Record<string, TrackProgress[]>>({});
  useEffect(() => {
    void (async () => {
      const [res, ans] = await Promise.all([loadStatResults(), loadStatAnswers()]);
      setAfter(playerAchievements(res, ans));
      setBefore(
        playerAchievements(
          res.filter((r) => r.startedAt !== result.startedAt),
          ans.filter((a) => a.startedAt !== result.startedAt),
        ),
      );
    })();
  }, [result.startedAt]);

  // Ligne de joueur sélectionnée → ouvre la fiche détaillée.
  const [selected, setSelected] = useState<PlayerSessionResult | null>(null);

  const detail = useMemo(() => {
    if (!selected) return null;
    const afterTracks = after[selected.playerId] ?? [];
    const beforeMap = new Map((before[selected.playerId] ?? []).map((t) => [t.track.id, t]));
    const tracks = afterTracks.map((t) => {
      const b = beforeMap.get(t.track.id);
      const justEarned = b ? Math.max(0, t.tiersReached - b.tiersReached) : t.tiersReached;
      return { t, justEarned };
    });
    // On met en avant les pistes où un palier vient de tomber.
    tracks.sort(
      (a, b) => b.justEarned - a.justEarned || b.t.tiersReached - a.t.tiersReached || b.t.value - a.t.value,
    );
    const pointsGained = achievementScore(afterTracks) - achievementScore(before[selected.playerId] ?? []);
    const newTiers = tracks.reduce((s, x) => s + x.justEarned, 0);
    return { tracks, pointsGained, newTiers };
  }, [selected, after, before]);

  const sd = selected ? disp(selected) : null;
  const selDetails = (selected?.details ?? {}) as { correct?: number; wrong?: number };
  const hasQA = selDetails.correct !== undefined || selDetails.wrong !== undefined;
  const selMedal = selected ? RANK_MEDALS[selected.rank - 1] ?? `${selected.rank}e` : '';

  return (
    <>
      <Screen
        title="Résultats"
        onBack={() => navigation.navigate('Home')}
        scroll
        footer={
          <>
            <Button
              title="Rejouer"
              emoji="🔁"
              onPress={() => navigation.navigate('GameConfig', { gameId: result.gameId, players })}
            />
            <Button title="Partager le résultat" emoji="📤" variant="secondary" onPress={() => void shareRecap()} />
            <View style={{ flexDirection: 'row', gap: spacing(1) }}>
              <Button title="Statistiques" variant="secondary" style={{ flex: 1 }} onPress={() => navigation.navigate('Stats')} />
              <Button title="Accueil" variant="ghost" style={{ flex: 1 }} onPress={() => navigation.navigate('Home')} />
            </View>
          </>
        }
      >
        {winner && (
          <View style={{ alignItems: 'center', gap: spacing(1), marginBottom: spacing(2) }}>
            <Txt size={fontSize.huge}>🏆</Txt>
            <PlayerAvatar emoji={winner.emoji} color={winner.color} size={72} playerId={ranked[0]?.playerId} />
            <Txt size={fontSize.xl} weight="900">
              {winner.name}
            </Txt>
            <Txt dim>gagne la partie !</Txt>
          </View>
        )}

        <Txt faint size={fontSize.xs} center style={{ marginBottom: spacing(1) }}>
          Touche un joueur pour voir son résumé et sa progression 👇
        </Txt>

        {ranked.map((r, i) => {
          const d = disp(r);
          const details = (r.details ?? {}) as { correct?: number; wrong?: number };
          return (
            <Card
              key={r.playerId}
              accent={i === 0 ? colors.warning : d.color}
              style={{ marginBottom: spacing(1) }}
              onPress={() => setSelected(r)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) }}>
                <Txt size={fontSize.lg} weight="900" style={{ width: 34 }}>
                  {RANK_MEDALS[i] ?? `${i + 1}.`}
                </Txt>
                <PlayerAvatar emoji={d.emoji} color={d.color} playerId={r.playerId} />
                <View style={{ flex: 1 }}>
                  <Txt weight="800">{d.name}</Txt>
                  {d.members ? (
                    <Txt faint size={fontSize.xs} numberOfLines={2}>
                      {d.members.map((m) => `${m.emoji} ${m.name}`).join('  ·  ')}
                    </Txt>
                  ) : (
                    <Txt faint size={fontSize.xs}>
                      {details.correct ?? 0} ✓ · {details.wrong ?? 0} ✗ · 🍺 {r.sipsDrunk} bu{r.sipsGiven > 0 ? ` · 🤙 ${r.sipsGiven} donné` : ''}
                    </Txt>
                  )}
                </View>
                <Txt size={fontSize.xl} weight="900" color={colors.primary}>
                  {r.points}
                </Txt>
                <Txt dim size={fontSize.lg}>›</Txt>
              </View>
            </Card>
          );
        })}
      </Screen>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {selected && sd && (
              <>
                <View style={styles.sheetHeader}>
                  <PlayerAvatar emoji={sd.emoji} color={sd.color} size={48} playerId={selected.playerId} />
                  <View style={{ flex: 1 }}>
                    <Txt weight="900" size={fontSize.lg} numberOfLines={1}>
                      {sd.name}
                    </Txt>
                    <Txt dim size={fontSize.sm}>
                      {selMedal} · {selected.points} pts cette partie
                    </Txt>
                  </View>
                  <Pressable onPress={() => setSelected(null)} hitSlop={12}>
                    <Txt size={fontSize.lg} dim weight="800">
                      ✕
                    </Txt>
                  </Pressable>
                </View>

                <ScrollView style={{ maxHeight: '72%' }} showsVerticalScrollIndicator={false}>
                  <Card style={{ marginBottom: spacing(1) }}>
                    <View style={styles.statGrid}>
                      <StatCell label="Rang" value={selMedal} />
                      <StatCell label="Points" value={String(selected.points)} />
                      {hasQA && <StatCell label="Bonnes" value={`${selDetails.correct ?? 0} ✅`} />}
                      {hasQA && <StatCell label="Ratées" value={`${selDetails.wrong ?? 0} ❌`} />}
                      {selected.sipsDrunk > 0 && <StatCell label="Bu" value={`${selected.sipsDrunk} 🍺`} />}
                      {selected.sipsGiven > 0 && <StatCell label="Donné" value={`${selected.sipsGiven} 🤙`} />}
                    </View>
                    {sd.members && (
                      <Txt faint size={fontSize.xs} style={{ marginTop: spacing(1) }}>
                        {sd.members.map((m) => `${m.emoji} ${m.name}`).join('  ·  ')}
                      </Txt>
                    )}
                  </Card>

                  {!ent.allAchievements && (
                    <Card accent={colors.accent} onPress={() => { setSelected(null); navigation.navigate('Store'); }}>
                      <Txt weight="800" size={fontSize.sm}>🔒 Progression des hauts faits</Txt>
                      <Txt faint size={fontSize.xs}>Débloque les hauts faits dans la Boutique — 1,99 €.</Txt>
                    </Card>
                  )}

                  {ent.allAchievements && detail && detail.tracks.length > 0 && (
                    <>
                      <View style={styles.deltaRow}>
                        <Txt weight="800">⭐ Progression des hauts faits</Txt>
                        <Txt weight="900" color={detail.pointsGained > 0 ? colors.success : colors.textFaint}>
                          {detail.pointsGained > 0 ? `+${detail.pointsGained} pts` : '—'}
                        </Txt>
                      </View>
                      {detail.newTiers > 0 && (
                        <Txt size={fontSize.sm} weight="800" color={colors.success} style={{ marginBottom: spacing(1) }}>
                          🎉 {detail.newTiers} nouveau{detail.newTiers > 1 ? 'x' : ''} palier{detail.newTiers > 1 ? 's' : ''} débloqué{detail.newTiers > 1 ? 's' : ''} cette partie !
                        </Txt>
                      )}
                      {detail.tracks.map(({ t, justEarned }) => (
                        <AchievementTrackCard key={t.track.id} t={t} justEarned={justEarned} />
                      ))}
                    </>
                  )}
                </ScrollView>

                {byId[selected.playerId] && (
                  <Button
                    title="Voir le profil complet"
                    emoji="🏅"
                    variant="secondary"
                    style={{ marginTop: spacing(1.5) }}
                    onPress={() => {
                      const pid = selected.playerId;
                      setSelected(null);
                      navigation.navigate('PlayerProfile', { playerId: pid });
                    }}
                  />
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );

  // Récap texte à partager (WhatsApp, etc.) via la feuille de partage native.
  async function shareRecap() {
    const title = getGame(result.gameId)?.title ?? 'Partie';
    const lines = ranked.map((r, i) => `${RANK_MEDALS[i] ?? `${i + 1}.`} ${disp(r).name} — ${r.points} pts`);
    const totalSips = result.players.reduce((s, p) => s + p.sipsDrunk, 0);
    const msg = [
      `🔒 Cancellable — ${title}`,
      winner ? `🏆 ${winner.name} gagne !` : '',
      '',
      ...lines,
      totalSips > 0 ? `\n🍺 ${totalSips} gorgées au total` : '',
      'Le jeu de vos soirées entre amis 🎉',
    ]
      .filter((l) => l !== '')
      .join('\n');
    try {
      await Share.share({ message: msg });
    } catch {
      // partage annulé — rien à faire
    }
  }
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Txt weight="900" size={fontSize.lg}>
        {value}
      </Txt>
      <Txt faint size={fontSize.xs}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing(2.5),
    maxHeight: '90%',
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), marginBottom: spacing(1.5) },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1.5), justifyContent: 'space-around' },
  statCell: { alignItems: 'center', minWidth: 64 },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1),
    gap: spacing(1),
  },
});
