import { Component, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '../theme/theme';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Filet de sécurité : capture une erreur de rendu React et affiche un écran de
 * récupération au lieu d'un écran blanc. Le bouton « Réessayer » remonte l'arbre.
 * Texte volontairement statique (FR + EN) pour ne dépendre d'aucun provider —
 * celui qui a planté est peut-être justement au-dessus.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary a capturé une erreur :', error);
  }

  private reset = () => this.setState({ error: null });

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.root}>
        <Text style={styles.emoji}>😅</Text>
        <Text style={styles.title}>Oups</Text>
        <Text style={styles.msg}>Une erreur est survenue. Tu peux réessayer.</Text>
        <Text style={styles.msgEn}>Something went wrong. Please try again.</Text>
        <Pressable onPress={this.reset} style={styles.btn}>
          <Text style={styles.btnLabel}>Réessayer · Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: spacing(3),
    gap: spacing(1),
  },
  emoji: { fontSize: 56 },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' as const },
  msg: { color: colors.textDim, fontSize: fontSize.md, textAlign: 'center' as const },
  msgEn: { color: colors.textFaint, fontSize: fontSize.sm, textAlign: 'center' as const, marginBottom: spacing(1) },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(3),
    borderRadius: radius.md,
    marginTop: spacing(1),
  },
  btnLabel: { color: colors.white, fontWeight: '800' as const, fontSize: fontSize.md },
};
