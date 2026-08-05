import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Txt } from '../components/ui';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { isProductOwned, PRODUCTS, type ProductId } from '../store/products';
import { colors, fontSize, spacing } from '../theme/theme';

export function StoreScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Store'>) {
  const store = useStore();
  const [busy, setBusy] = useState<ProductId | null>(null);
  const [restoring, setRestoring] = useState(false);

  const buy = async (id: ProductId) => {
    setBusy(id);
    try {
      const ok = await store.purchase(id);
      if (ok) Alert.alert('Merci ! 🎉', 'Ton achat est activé.');
      else Alert.alert('Achat annulé', "L'achat n'a pas abouti.");
    } catch {
      Alert.alert('Erreur', "L'achat a échoué, réessaie plus tard.");
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    setRestoring(true);
    try {
      await store.restore();
      Alert.alert('Achats restaurés', 'Tes achats précédents ont été réappliqués.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Screen title="Boutique" subtitle="Soutiens le jeu et débloque tout" onBack={() => navigation.goBack()} scroll>
      <Txt faint size={fontSize.xs} style={{ marginBottom: spacing(1) }}>
        Achats uniques, définitifs et sans abonnement. Le pack « Tout débloquer » est le plus avantageux.
      </Txt>

      {PRODUCTS.map((p) => {
        const owned = isProductOwned(p.id, store.owned);
        const isBundle = p.id === 'unlock_all';
        return (
          <Card key={p.id} accent={isBundle ? colors.accent : owned ? colors.success : colors.primary} style={styles.card}>
            <View style={styles.row}>
              <Txt size={fontSize.xxl}>{p.emoji}</Txt>
              <View style={{ flex: 1 }}>
                <Txt weight="800">{p.title}</Txt>
                <Txt faint size={fontSize.xs}>{p.description}</Txt>
              </View>
            </View>
            <View style={[styles.row, { marginTop: spacing(1), justifyContent: 'space-between' }]}>
              <Txt weight="800" color={colors.primary}>{p.price}</Txt>
              {owned ? (
                <Txt weight="800" color={colors.success}>✓ Débloqué</Txt>
              ) : (
                <Button
                  title="Acheter"
                  size="sm"
                  variant={isBundle ? 'accent' : 'primary'}
                  loading={busy === p.id}
                  disabled={busy !== null}
                  onPress={() => void buy(p.id)}
                />
              )}
            </View>
          </Card>
        );
      })}

      <View style={{ height: spacing(1) }} />
      <Button title="Restaurer mes achats" variant="ghost" loading={restoring} onPress={() => void restore()} />

      <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(2) }}>
        Version de démonstration : les achats sont simulés localement. En production, ils passeront par
        Google Play.
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing(1) },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },
});
