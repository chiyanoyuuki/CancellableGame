import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { Button, Txt } from '../components/ui';
import { colors, fontSize, radius, spacing } from '../theme/theme';
import { localBilling } from './billing';
import {
  loadFreeUniverses,
  loadOnboarded,
  loadOwned,
  saveFreeUniverses,
  saveOnboarded,
  saveOwned,
} from './persistence';
import { deriveEntitlements, type Entitlements, type ProductId } from './products';

interface StoreValue {
  loading: boolean;
  owned: Set<string>;
  ent: Entitlements;
  freeUniverses: Set<string>;
  onboarded: boolean;
  /** Un univers / « #thème » est-il jouable pour cet utilisateur ? */
  isUniverseUnlocked: (category: string) => boolean;
  /** Achète (ou simule) un produit ; met à jour les droits. */
  purchase: (id: ProductId) => Promise<boolean>;
  /** Restaure les achats précédents. */
  restore: () => Promise<void>;
  /** Termine l'onboarding en enregistrant les univers gratuits choisis. */
  completeOnboarding: (universes: string[]) => Promise<void>;
  /**
   * Demande le lancement d'une partie : montre une pub interstitielle si
   * nécessaire (au-delà de la première partie de la session, sauf « sans pub »),
   * puis exécute `launch`.
   */
  requestGameStart: (launch: () => void) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useStore must be used within a StoreProvider');
  return v;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [freeUniverses, setFreeUniverses] = useState<Set<string>>(new Set());
  const [onboarded, setOnboarded] = useState(false);

  // Compteur de parties lancées dans la session courante (remis à zéro au
  // redémarrage de l'app) : la première est sans pub, les suivantes avec.
  const gamesThisSession = useRef(0);

  // Interstitiel simulé, piloté par une promesse.
  const [adVisible, setAdVisible] = useState(false);
  const adResolver = useRef<(() => void) | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [o, f, ob] = await Promise.all([loadOwned(), loadFreeUniverses(), loadOnboarded()]);
      if (!alive) return;
      setOwned(new Set(o));
      setFreeUniverses(new Set(f));
      setOnboarded(ob);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const ent = useMemo(() => deriveEntitlements(owned), [owned]);

  const isUniverseUnlocked = useCallback(
    (category: string) => ent.allThemes || freeUniverses.has(category),
    [ent.allThemes, freeUniverses],
  );

  const purchase = useCallback(
    async (id: ProductId): Promise<boolean> => {
      const ok = await localBilling.purchase(id);
      if (ok) {
        const next = new Set(owned);
        next.add(id);
        setOwned(next);
        await saveOwned(next);
      }
      return ok;
    },
    [owned],
  );

  const restore = useCallback(async (): Promise<void> => {
    const ids = await localBilling.restore();
    const next = new Set(owned);
    for (const id of ids) next.add(id);
    setOwned(next);
    await saveOwned(next);
  }, [owned]);

  const completeOnboarding = useCallback(async (universes: string[]): Promise<void> => {
    const s = new Set(universes);
    setFreeUniverses(s);
    setOnboarded(true);
    await saveFreeUniverses(universes);
    await saveOnboarded(true);
  }, []);

  const showInterstitial = useCallback(
    () =>
      new Promise<void>((resolve) => {
        adResolver.current = resolve;
        setAdVisible(true);
      }),
    [],
  );

  const closeAd = useCallback(() => {
    setAdVisible(false);
    const r = adResolver.current;
    adResolver.current = null;
    r?.();
  }, []);

  const requestGameStart = useCallback(
    (launch: () => void) => {
      const go = () => {
        gamesThisSession.current += 1;
        launch();
      };
      if (gamesThisSession.current >= 1 && !ent.noAds) {
        void showInterstitial().then(go);
      } else {
        go();
      }
    },
    [ent.noAds, showInterstitial],
  );

  const value: StoreValue = {
    loading,
    owned,
    ent,
    freeUniverses,
    onboarded,
    isUniverseUnlocked,
    purchase,
    restore,
    completeOnboarding,
    requestGameStart,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
      <InterstitialAd visible={adVisible} onDone={closeAd} />
    </StoreContext.Provider>
  );
}

/**
 * Pub interstitielle SIMULÉE : un compte à rebours puis un bouton pour
 * continuer. À remplacer par un vrai interstitiel AdMob en production.
 */
function InterstitialAd({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const [left, setLeft] = useState(4);

  useEffect(() => {
    if (!visible) return;
    setLeft(4);
    const iv = setInterval(() => setLeft((n) => (n > 0 ? n - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={left === 0 ? onDone : undefined}>
      <View style={styles.adBackdrop}>
        <View style={styles.adCard}>
          <Txt faint size={fontSize.xs} weight="800">
            PUBLICITÉ
          </Txt>
          <Txt size={fontSize.huge} style={{ marginVertical: spacing(1) }}>
            📺
          </Txt>
          <Txt weight="800" size={fontSize.lg} center>
            Publicité simulée
          </Txt>
          <Txt faint size={fontSize.sm} center style={{ marginTop: spacing(0.5) }}>
            En production, un vrai interstitiel AdMob s'afficherait ici avant de lancer la partie.
          </Txt>
          <View style={{ height: spacing(2) }} />
          {left > 0 ? (
            <Txt dim weight="700">
              Vous pourrez continuer dans {left} s…
            </Txt>
          ) : (
            <Button title="Continuer" size="lg" onPress={onDone} style={{ alignSelf: 'stretch' }} />
          )}
          <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(1.5) }}>
            Astuce : « Sans publicité » retire ces écrans pour toujours.
          </Txt>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  adBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center', padding: spacing(3) },
  adCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing(3),
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
  },
});
