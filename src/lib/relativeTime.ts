/**
 * Formatage d'une date relative, courte et traduisible ("aujourd'hui", "hier",
 * "il y a 3 j", "il y a 2 sem.", "il y a 5 mois", "il y a 2 ans"). Utilisé pour
 * afficher la dernière partie jouée d'un profil.
 *
 * Le calcul se fait en jours calendaires (minuit local) pour que "hier" reste
 * "hier" même joué à 23 h la veille.
 */
import { t } from './i18n';

const DAY_MS = 86_400_000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Différence en jours calendaires entre `ts` et `now` (>= 0 dans le passé). */
export function daysAgo(ts: number, now: number = Date.now()): number {
  return Math.round((startOfDay(now) - startOfDay(ts)) / DAY_MS);
}

/** Libellé relatif court et traduit pour un horodatage passé. */
export function relativeDay(ts: number, now: number = Date.now()): string {
  const days = daysAgo(ts, now);
  if (days <= 0) return t("aujourd'hui");
  if (days === 1) return t('hier');
  if (days < 7) return t('il y a {n} j', { n: days });
  if (days < 30) {
    const w = Math.floor(days / 7);
    return t('il y a {n} sem.', { n: w });
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return t('il y a {n} mois', { n: m });
  }
  const y = Math.floor(days / 365);
  return t(y > 1 ? 'il y a {n} ans' : 'il y a {n} an', { n: y });
}
