import { StyleSheet, View } from 'react-native';

import { TIER_META, type TrackProgress } from '../core/achievements';
import { useT } from '../lib/i18nProvider';
import { colors, fontSize, spacing } from '../theme/theme';
import { Card, ProgressBar, Txt } from './ui';

/**
 * Carte d'une piste de hauts faits : emoji, titre, palier atteint, barre de
 * progression vers le palier suivant, et points cumulés. Partagée entre le
 * profil du joueur et le récap de fin de partie.
 *
 * `justEarned` (optionnel) : nombre de paliers franchis À L'INSTANT (dans la
 * partie qu'on vient de terminer). S'il est > 0, la carte est mise en avant
 * avec un bandeau « nouveau palier ! ».
 */
export function AchievementTrackCard({ t, justEarned = 0 }: { t: TrackProgress; justEarned?: number }) {
  const tr = useT();
  const tier = t.current ? TIER_META[t.current] : null;
  const prevTarget = t.tiersReached > 0 ? t.track.tiers[t.tiersReached - 1]!.target : 0;
  const nextTarget = t.next?.target ?? t.value;
  const span = Math.max(1, nextTarget - prevTarget);
  const within = Math.min(span, Math.max(0, t.value - prevTarget));
  const fresh = justEarned > 0;
  return (
    <Card style={[{ marginBottom: spacing(1) }, fresh ? { backgroundColor: colors.cardAlt } : null]} accent={tier?.color}>
      <View style={styles.row}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1), flex: 1 }}>
          <Txt size={fontSize.lg}>{t.track.emoji}</Txt>
          <View style={{ flex: 1 }}>
            <Txt weight="800">{tr(t.track.title)}</Txt>
            <Txt faint size={fontSize.xs}>{tr(t.track.desc)}</Txt>
          </View>
        </View>
        {tier ? (
          <View style={[styles.tierPill, { borderColor: tier.color }]}>
            <Txt size={fontSize.xs} weight="800" color={tier.color}>
              {tier.emoji} {tr(tier.label)}
            </Txt>
          </View>
        ) : (
          <Txt faint size={fontSize.xs} weight="800">
            {tr('🔒 à débloquer')}
          </Txt>
        )}
      </View>
      {fresh && (
        <View style={[styles.freshBadge, { borderColor: tier?.color ?? colors.accent }]}>
          <Txt size={fontSize.xs} weight="900" color={tier?.color ?? colors.accent}>
            {justEarned > 1 ? tr('✨ Nouveaux paliers ×{n} cette partie !', { n: justEarned }) : tr('✨ Nouveau palier cette partie !')}
          </Txt>
        </View>
      )}
      <View style={{ marginTop: spacing(1) }}>
        <ProgressBar value={t.next ? within : 1} total={t.next ? span : 1} color={tier?.color ?? colors.primary} />
      </View>
      <View style={[styles.row, { marginTop: spacing(0.5) }]}>
        <Txt faint size={fontSize.xs}>
          {t.value} {tr(t.track.unit)}
          {t.next ? tr(' · prochain palier à {n}', { n: t.next.target }) : tr(' · palier max atteint 👑')}
        </Txt>
        <Txt faint size={fontSize.xs} weight="800">
          {t.points} pts
        </Txt>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) },
  tierPill: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: spacing(1), paddingVertical: 2 },
  freshBadge: {
    marginTop: spacing(1),
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing(1),
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
});
