import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, HowToPlay, Segmented, SectionHeader, Txt } from '../../components/ui';
import type { AliasConfig, AliasTeam } from '../../core/aliasEngine';
import { useT } from '../../lib/i18nProvider';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';

const TEAM_PRESET: AliasTeam[] = [
  { id: 'rouge', name: 'Rouges', emoji: '🔴', color: '#ff5c5c' },
  { id: 'bleu', name: 'Bleus', emoji: '🔵', color: '#5cc6ff' },
  { id: 'vert', name: 'Verts', emoji: '🟢', color: '#33d69f' },
  { id: 'jaune', name: 'Jaunes', emoji: '🟡', color: '#ffd166' },
];

export function AliasConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const t = useT();
  const [teamCount, setTeamCount] = useState(2);
  const [roundsPerTeam, setRoundsPerTeam] = useState(2);
  const [roundSeconds, setRoundSeconds] = useState(45);

  const maxTeams = Math.min(4, Math.max(2, Math.floor(players.length / 2)));
  const effectiveCount = Math.min(teamCount, maxTeams);
  const valid = players.length >= 4;

  const launch = () =>
    onStart({
      teams: TEAM_PRESET.slice(0, effectiveCount),
      roundsPerTeam,
      roundSeconds,
    } satisfies AliasConfig);

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">{t('🗣️ Fais deviner')}</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {t('En équipes : fais deviner un maximum de mots aux tiens sans les prononcer, contre le chrono.')}
        </Txt>
      </Card>

      <HowToPlay
        lines={[
          t("À son tour, une équipe désigne un « décriveur » qui tient le téléphone."),
          t('Il voit un mot et le fait deviner à son équipe SANS le dire (ni traduction, ni « ça rime avec »).'),
          t('Chaque mot trouvé = 1 point. On peut passer un mot trop dur.'),
          t('Au temps écoulé, on passe à l\'équipe suivante. La plus haute après le même nombre de tours gagne.'),
        ]}
      />

      <SectionHeader title={t('Équipes')} />
      <Segmented<string>
        value={String(effectiveCount)}
        onChange={(v) => setTeamCount(Number(v))}
        options={[2, 3, 4].filter((n) => n <= maxTeams).map((n) => ({ label: t('{n} équipes', { n }), value: String(n) }))}
      />
      <Txt faint size={fontSize.xs}>
        {t('Répartissez-vous physiquement : {teams}.', { teams: TEAM_PRESET.slice(0, effectiveCount).map((x) => `${x.emoji} ${t(x.name)}`).join(', ') })}
      </Txt>

      <SectionHeader title={t('Tours par équipe')} />
      <Segmented<string>
        value={String(roundsPerTeam)}
        onChange={(v) => setRoundsPerTeam(Number(v))}
        options={[2, 3, 4].map((n) => ({ label: `${n}`, value: String(n) }))}
      />

      <SectionHeader title={t('Durée du tour')} />
      <Segmented<string>
        value={String(roundSeconds)}
        onChange={(v) => setRoundSeconds(Number(v))}
        options={[
          { label: '30 s', value: '30' },
          { label: '45 s', value: '45' },
          { label: '60 s', value: '60' },
        ]}
      />

      <View style={{ height: spacing(1) }} />
      <Button title={t('Lancer Fais deviner')} emoji="🗣️" size="lg" variant="accent" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          {t('Il faut au moins 4 joueurs (2 par équipe).')}
        </Txt>
      )}
    </View>
  );
}
