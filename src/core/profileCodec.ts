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
 *
 * Deux formats de charge utile :
 *  - v1 : `u` = liste des noms d'univers (lisible mais long).
 *  - v2 : `u` = liste d'INDICES dans le catalogue + `v` = taille du catalogue
 *         (garde-fou anti-décalage). Bien plus compact → QR petit et scannable
 *         même avec beaucoup d'univers évités. Le décodage nécessite le
 *         catalogue pour retrouver les noms.
 */
export interface RemoteProfile {
  name: string;
  emoji: string;
  color: string;
  /** Univers que le joueur ne souhaite pas, par leur nom exact. */
  unwanted: string[];
}

/**
 * Nettoie un emoji d'avatar scanné : retire le caractère de remplacement U+FFFD
 * (symptôme d'un ancien QR corrompu, qui s'affichait en « ? ») et les caractères
 * de contrôle. Si rien de valide ne reste, renvoie '' pour que l'appli applique
 * un avatar par défaut plutôt qu'un carré « ? » illisible.
 */
function sanitizeEmoji(raw: string): string {
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\uFFFD\u0000-\u001F\u007F]/g, '').trim();
}

const MAGIC = 'CANCELLABLE-PROFILE';
const VERSION = 1; // version écrite par encodeProfile (noms) ; v2 = indices, v3 = hash
const VERSION_MAX = 3; // version la plus récente que decodeProfile sait lire

/**
 * Code stable d'un univers, dérivé de SON NOM (FNV-1a 32 bits → 8 hex). Sert au
 * format v3 : contrairement aux indices (v2), il ne dépend NI de l'ordre NI de
 * la taille du catalogue, donc un profil scanné reste correct même si l'app et
 * le formulaire web n'ont pas exactement la même liste d'univers (l'un a été mis
 * à jour avant l'autre). DOIT rester identique ici et dans webform/index.html.
 */
export function universeCode(name: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
const MAX_NAME = 40;
const MAX_EMOJI = 16;
const MAX_COLOR = 16;
const MAX_UNIVERSE = 80;
const MAX_UNWANTED = 400;

/** Sérialise un profil (format v1, noms d'univers en clair). */
export function encodeProfile(p: RemoteProfile): string {
  const body = JSON.stringify({ n: p.name, e: p.emoji, c: p.color, u: p.unwanted });
  return `${MAGIC}|${VERSION}|${body}`;
}

/**
 * Sérialise un profil au format v2 (compact) : les univers sont encodés par
 * leur indice dans `catalogue`. Beaucoup plus court que les noms → QR scannable
 * même avec des dizaines d'univers évités.
 */
export function encodeProfileCompact(p: RemoteProfile, catalogue: readonly string[]): string {
  const index = new Map(catalogue.map((u, i) => [u, i] as const));
  const u = p.unwanted
    .map((n) => index.get(n))
    .filter((i): i is number => i !== undefined);
  const body = JSON.stringify({ n: p.name, e: p.emoji, c: p.color, v: catalogue.length, u });
  return `${MAGIC}|2|${body}`;
}

/**
 * Sérialise un profil au format v3 : les univers évités sont encodés par le HASH
 * de leur nom (8 hex chacun, concaténés). Compact ET insensible au décalage de
 * catalogue entre l'app et le formulaire web — le format à privilégier.
 */
export function encodeProfileHashed(p: RemoteProfile): string {
  const u = p.unwanted.map(universeCode).join('');
  const body = JSON.stringify({ n: p.name, e: p.emoji, c: p.color, u });
  return `${MAGIC}|3|${body}`;
}

/**
 * Relit une chaîne scannée. Renvoie null si ce n'est pas un profil Cancellable
 * valide (mauvais préfixe, version plus récente, JSON invalide, nom manquant).
 * Tous les champs sont validés et bornés : le QR est une entrée non fiable.
 *
 * Pour un profil v2 (univers par indices), fournir `catalogue` pour retrouver
 * les noms ; sans catalogue, ou si sa taille ne correspond pas à celle encodée
 * dans le QR (décalage), les univers évités sont ignorés (le profil reste
 * importable, simplement sans exclusions).
 */
export function decodeProfile(raw: string, catalogue?: readonly string[]): RemoteProfile | null {
  if (typeof raw !== 'string') return null;
  // On repère le préfixe où qu'il soit et on repart de là : un scanner peut
  // préfixer un octet parasite (BOM U+FEFF, caractère de remplacement U+FFFD
  // d'un ancien QR corrompu…) que `trim()` ne retire pas forcément.
  const magicAt = raw.indexOf(MAGIC);
  if (magicAt < 0) return null;
  const trimmed = raw.slice(magicAt).trim();

  const sep1 = trimmed.indexOf('|'); // MAGIC ne contient pas de « | »
  if (sep1 < 0) return null;
  const sep2 = trimmed.indexOf('|', sep1 + 1);
  if (sep2 < 0) return null;

  const version = Number(trimmed.slice(sep1 + 1, sep2));
  // Une version plus récente que celle qu'on connaît n'est pas garantie lisible.
  if (!Number.isInteger(version) || version < 1 || version > VERSION_MAX) return null;

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

  const emoji = typeof o.e === 'string' ? sanitizeEmoji(o.e).slice(0, MAX_EMOJI) : '';
  const color = typeof o.c === 'string' ? o.c.slice(0, MAX_COLOR) : '';

  let unwanted: string[];
  if (version >= 3) {
    // v3 : `u` = codes de hash (8 hex) concaténés. On reconstruit une table
    // hash → nom depuis le catalogue courant et on retrouve chaque univers. Rien
    // ne dépend de l'ordre ni de la taille : robuste au décalage app/web.
    const cat = catalogue ?? [];
    const byCode = new Map<string, string>();
    for (const u of cat) byCode.set(universeCode(u), u);
    const s = typeof o.u === 'string' ? o.u : '';
    const out: string[] = [];
    for (let i = 0; i + 8 <= s.length && out.length < MAX_UNWANTED; i += 8) {
      const name = byCode.get(s.slice(i, i + 8).toLowerCase());
      if (name) out.push(name);
    }
    unwanted = out;
  } else if (version === 2) {
    // `u` = indices dans le catalogue ; `v` = taille du catalogue à l'encodage.
    const cat = catalogue ?? null;
    const drift = typeof o.v === 'number' && cat !== null && o.v !== cat.length;
    if (!cat || drift) {
      unwanted = []; // impossible de mapper de façon fiable → aucune exclusion
    } else {
      unwanted = (Array.isArray(o.u) ? o.u : [])
        .filter((i): i is number => Number.isInteger(i) && (i as number) >= 0 && (i as number) < cat.length)
        .map((i) => cat[i]!)
        .slice(0, MAX_UNWANTED);
    }
  } else {
    unwanted = Array.isArray(o.u)
      ? o.u
          .filter((x): x is string => typeof x === 'string')
          .map((x) => x.slice(0, MAX_UNIVERSE))
          .slice(0, MAX_UNWANTED)
      : [];
  }

  return { name, emoji, color, unwanted };
}

/** Vrai si la chaîne ressemble à un profil Cancellable (préfixe reconnu, même
 * précédé d'un octet parasite de scan). */
export function isProfileCode(raw: string): boolean {
  return typeof raw === 'string' && raw.indexOf(`${MAGIC}|`) >= 0;
}
