import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Chip, Txt } from './ui';
import { matchesQuery, presentPinned } from '../core/universePrefs';
import { type Theme, THEME_META } from '../core/models';
import { useT } from '../lib/i18nProvider';
import { colors, fontSize, radius, spacing } from '../theme/theme';

export interface UniverseGroup {
  theme: Theme;
  universes: string[];
}

/**
 * Sélecteur d'univers en « drill-down » (maître → détail), présenté en plein
 * écran :
 *   Niveau 1 — la liste des thèmes (chacun affiche « X/Y univers actifs »).
 *   Niveau 2 — en tapant un thème, ses univers à activer/désactiver un par un
 *              (ou tout / rien d'un coup).
 * Une recherche aplatit la vue sur tous les univers correspondants, tous
 * thèmes confondus. Contrôlé : l'appelant garde la liste des univers EXCLUS et
 * fournit les callbacks — le composant ne stocke que l'état de navigation.
 *
 * Générique : réutilisable par le quiz et par les autres modes (via
 * ContentPicker). Les favoris ★ sont optionnels.
 */
export function UniversePickerModal(props: {
  visible: boolean;
  onClose: () => void;
  groups: UniverseGroup[];
  /** Univers actuellement EXCLUS (désactivés). */
  excluded: Set<string>;
  onToggle: (universe: string) => void;
  /** Active (exclude=false) ou désactive (exclude=true) une liste d'un coup. */
  onBulk: (universes: string[], exclude: boolean) => void;
  isUnlocked: (universe: string) => boolean;
  favorites?: string[];
  onToggleFavorite?: (universe: string) => void;
  /** Univers récemment joués (accès rapide en tête de la liste des thèmes). */
  recent?: string[];
  /** Sous-titre optionnel (ex. rappel du nombre de questions dispo). */
  subtitle?: string;
}) {
  const t = useT();
  const { visible, onClose, groups, excluded, onToggle, onBulk, isUnlocked } = props;
  const favorites = props.favorites ?? [];
  const recent = props.recent ?? [];
  const [theme, setTheme] = useState<Theme | null>(null);
  const [search, setSearch] = useState('');

  // À chaque (ré)ouverture, on repart de la liste des thèmes, recherche vide.
  useEffect(() => {
    if (visible) {
      setTheme(null);
      setSearch('');
    }
  }, [visible]);

  const allUniverses = useMemo(() => groups.flatMap((g) => g.universes), [groups]);
  const availableSet = useMemo(() => new Set(allUniverses), [allUniverses]);
  const favPresent = useMemo(() => presentPinned(favorites, availableSet), [favorites, availableSet]);
  const recentPresent = useMemo(
    () => presentPinned(recent, availableSet).filter((u) => !favorites.includes(u)),
    [recent, availableSet, favorites],
  );
  const activeCount = (list: readonly string[]) => list.filter((u) => !excluded.has(u)).length;
  const searching = search.trim().length > 0;

  // Résultats de recherche à plat, regroupés par thème pour garder le repère.
  const searchGroups = useMemo(() => {
    if (!searching) return [];
    return groups
      .map((g) => ({ theme: g.theme, universes: g.universes.filter((u) => matchesQuery(u, search)) }))
      .filter((g) => g.universes.length > 0);
  }, [groups, search, searching]);

  const current = theme ? groups.find((g) => g.theme === theme) : null;

  const renderUniverse = (u: string) => {
    if (!isUnlocked(u)) {
      return (
        <View key={u} style={{ opacity: 0.45 }}>
          <Chip label={`🔒 ${u}`} selected={false} />
        </View>
      );
    }
    const fav = favorites.includes(u);
    return (
      <Chip
        key={u}
        label={fav ? `★ ${u}` : u}
        selected={!excluded.has(u)}
        onPress={() => onToggle(u)}
        onLongPress={props.onToggleFavorite ? () => props.onToggleFavorite!(u) : undefined}
      />
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right', 'bottom']}>
        {/* Barre d'en-tête : retour au niveau thèmes si on est dans un thème. */}
        <View style={styles.header}>
          {theme ? (
            <Pressable onPress={() => setTheme(null)} hitSlop={10} style={styles.headerBtn}>
              <Txt weight="800" color={colors.primary}>{t('‹ Thèmes')}</Txt>
            </Pressable>
          ) : (
            <View style={styles.headerBtn} />
          )}
          <Txt weight="900" size={fontSize.lg} numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
            {theme ? `${THEME_META[theme].emoji} ${t(THEME_META[theme].label)}` : t('Choisir les univers')}
          </Txt>
          <Pressable onPress={onClose} hitSlop={10} style={[styles.headerBtn, { alignItems: 'flex-end' }]}>
            <Txt weight="800" color={colors.primary}>{t('Terminé')}</Txt>
          </Pressable>
        </View>

        {!!props.subtitle && !theme && (
          <Txt faint size={fontSize.xs} center style={{ paddingHorizontal: spacing(2), marginBottom: spacing(1) }}>
            {props.subtitle}
          </Txt>
        )}

        {/* Recherche + actions globales, seulement au niveau thèmes. */}
        {!theme && (
          <View style={{ paddingHorizontal: spacing(2), gap: spacing(1) }}>
            <TextInput
              style={styles.search}
              value={search}
              onChangeText={setSearch}
              placeholder={t('Rechercher un univers…')}
              placeholderTextColor={colors.textFaint}
              autoCorrect={false}
            />
            <View style={styles.rowWrap}>
              <Button size="sm" variant="secondary" title={t('Tout activer')} onPress={() => onBulk(allUniverses, false)} />
              <Button size="sm" variant="secondary" title={t('Tout désactiver')} onPress={() => onBulk(allUniverses, true)} />
              <View style={{ flex: 1 }} />
              <Txt faint size={fontSize.xs} weight="800" style={{ alignSelf: 'center' }}>
                {t('{n}/{total} actifs', { n: activeCount(allUniverses), total: allUniverses.length })}
              </Txt>
            </View>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {searching ? (
            // --- Résultats de recherche (à plat, groupés par thème) ---
            searchGroups.length === 0 ? (
              <Txt faint center style={{ marginTop: spacing(3) }}>{t('Aucun univers ne correspond à la recherche.')}</Txt>
            ) : (
              searchGroups.map((g) => (
                <View key={g.theme} style={{ marginBottom: spacing(2) }}>
                  <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.75) }}>
                    {THEME_META[g.theme].emoji} {t(THEME_META[g.theme].label).toUpperCase()}
                  </Txt>
                  <View style={styles.rowWrap}>{g.universes.map(renderUniverse)}</View>
                </View>
              ))
            )
          ) : theme && current ? (
            // --- Niveau 2 : les univers d'un thème ---
            <>
              <View style={styles.rowWrap}>
                <Button size="sm" variant="secondary" title={t('Tout activer')} onPress={() => onBulk(current.universes, false)} />
                <Button size="sm" variant="secondary" title={t('Tout désactiver')} onPress={() => onBulk(current.universes, true)} />
                <View style={{ flex: 1 }} />
                <Txt faint size={fontSize.xs} weight="800" style={{ alignSelf: 'center' }}>
                  {t('{n}/{total} actifs', { n: activeCount(current.universes), total: current.universes.length })}
                </Txt>
              </View>
              {props.onToggleFavorite && (
                <Txt faint size={fontSize.xs} style={{ marginTop: spacing(1) }}>
                  {t('Appui long sur un univers pour le mettre en favori ★.')}
                </Txt>
              )}
              <View style={[styles.rowWrap, { marginTop: spacing(1.5) }]}>{current.universes.map(renderUniverse)}</View>
            </>
          ) : (
            // --- Niveau 1 : accès rapides (favoris / récents) + liste des thèmes ---
            <>
              {favPresent.length > 0 && (
                <View style={{ marginBottom: spacing(1.5) }}>
                  <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.75) }}>
                    ★ {t('FAVORIS')}
                  </Txt>
                  <View style={styles.rowWrap}>{favPresent.map(renderUniverse)}</View>
                </View>
              )}
              {recentPresent.length > 0 && (
                <View style={{ marginBottom: spacing(1.5) }}>
                  <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.75) }}>
                    🕹️ {t('RÉCEMMENT JOUÉS')}
                  </Txt>
                  <View style={styles.rowWrap}>{recentPresent.map(renderUniverse)}</View>
                </View>
              )}
              {groups.map((g) => {
                const active = activeCount(g.universes);
                const all = active === g.universes.length;
                const none = active === 0;
                return (
                  <Pressable key={g.theme} onPress={() => setTheme(g.theme)} style={styles.themeRow}>
                    <Txt size={fontSize.xl}>{THEME_META[g.theme].emoji}</Txt>
                    <View style={{ flex: 1 }}>
                      <Txt weight="800" numberOfLines={1}>{t(THEME_META[g.theme].label)}</Txt>
                      <Txt
                        faint
                        size={fontSize.xs}
                        weight="700"
                        color={none ? colors.danger : all ? colors.success : colors.textDim}
                      >
                        {none
                          ? t('Aucun univers actif')
                          : all
                            ? t('Tous les univers ({n})', { n: g.universes.length })
                            : t('{n}/{total} univers actifs', { n: active, total: g.universes.length })}
                      </Txt>
                    </View>
                    <Txt size={fontSize.lg} color={colors.textFaint}>›</Txt>
                  </Pressable>
                );
              })}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: { minWidth: 72, justifyContent: 'center' },
  search: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(1),
  },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1), alignItems: 'center' },
  body: { padding: spacing(2), paddingBottom: spacing(6) },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(1.5),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing(1),
  },
});
