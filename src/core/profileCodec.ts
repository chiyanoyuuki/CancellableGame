/**
 * Codec des profils « à distance » : sérialise un profil (nom, emoji, couleur,
 * univers non souhaités) en une courte chaîne de texte destinée à un QR code,
 * et le relit. Aucune dépendance : le même code tourne en React Native, dans le
 * navigateur (formulaire web des invités) et sous Node (tests).
 *
 * Idée : l'invité remplit son profil sur une page web, celle-ci affiche un QR
 * contenant cette chaîne ; l'app hôte le scanne pour importer le profil. RIEN
 * ne transite par un serveur — la donnée voyage uniquement dans le QR. Le
 * contenu scanné étant NON fiable, `decodeProfile` valide et borne tout.
 */
export interface RemoteProfile {
  name: string;
  emoji: string;
  color: string;
  /** Univers que le joueur ne souhaite pas, par leur nom exact. */
  unwanted: string[];
}

const MAGIC = 'CANCELLABLE-PROFILE';
const VERSION = 1;
const MAX_NAME = 40;
const MAX_EMOJI = 16;
const MAX_COLOR = 16;
const MAX_UNIVERSE = 80;
const MAX_UNWANTED = 400;

/** Sérialise un profil en une chaîne compacte à mettre dans un QR code. */
export function encodeProfile(p: RemoteProfile): string {
  const body = JSON.stringify({ n: p.name, e: p.emoji, c: p.color, u: p.unwanted });
  return `${MAGIC}|${VERSION}|${body}`;
}

/**
 * Relit une chaîne scannée. Renvoie null si ce n'est pas un profil Cancellable
 * valide (mauvais préfixe, version plus récente, JSON invalide, nom manquant).
 * Tous les champs sont validés et bornés : le QR est une entrée non fiable.
 */
export function decodeProfile(raw: string): RemoteProfile | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  const sep1 = trimmed.indexOf('|');
  if (sep1 < 0 || trimmed.slice(0, sep1) !== MAGIC) return null;
  const sep2 = trimmed.indexOf('|', sep1 + 1);
  if (sep2 < 0) return null;

  const version = Number(trimmed.slice(sep1 + 1, sep2));
  // Une version plus récente que celle qu'on connaît n'est pas garantie lisible.
  if (!Number.isInteger(version) || version < 1 || version > VERSION) return null;

  let obj: unknown;
  try {
    obj = JSON.parse(trimmed.slice(sep2 + 1));
  } catch {
    return null;
  }
  if (!obj || typeof obj !== 'object') return null;
  const o = obj as Record<string, unknown>;

  const name = typeof o.n === 'string' ? o.n.trim().slice(0, MAX_NAME) : '';
  if (!name) return null; // le nom est le minimum vital

  const emoji = typeof o.e === 'string' ? o.e.slice(0, MAX_EMOJI) : '';
  const color = typeof o.c === 'string' ? o.c.slice(0, MAX_COLOR) : '';
  const unwanted = Array.isArray(o.u)
    ? o.u
        .filter((x): x is string => typeof x === 'string')
        .map((x) => x.slice(0, MAX_UNIVERSE))
        .slice(0, MAX_UNWANTED)
    : [];

  return { name, emoji, color, unwanted };
}

/** Vrai si la chaîne ressemble à un profil Cancellable (préfixe reconnu). */
export function isProfileCode(raw: string): boolean {
  return typeof raw === 'string' && raw.trim().startsWith(`${MAGIC}|`);
}
