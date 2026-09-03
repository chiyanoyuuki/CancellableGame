import type { StyleProp, TextStyle } from 'react-native';

import { Txt } from './ui';
import type { Theme } from '../core/models';
import { getQuestionHint, questionHintText } from '../lib/questionHint';
import { useT } from '../lib/i18nProvider';
import { colors, fontSize, spacing } from '../theme/theme';

/**
 * Petite ligne de contexte affichée avec une question : univers / thème / les
 * deux / rien, selon la préférence globale (Réglages). Réutilisée par tous les
 * modes pour que l'indice soit COHÉRENT partout — et présent par défaut, car
 * sans lui beaucoup de questions sont trop dures.
 */
export function QuestionHint({
  theme,
  universe,
  center,
  style,
}: {
  theme: Theme;
  universe?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const t = useT();
  const text = questionHintText(theme, universe, t, getQuestionHint());
  if (!text) return null;
  return (
    <Txt
      faint
      center={center}
      size={fontSize.xs}
      weight="800"
      color={colors.accent}
      style={[{ marginBottom: spacing(0.5) }, style]}
    >
      {text}
    </Txt>
  );
}
