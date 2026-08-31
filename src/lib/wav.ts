/**
 * Synthèse audio minimale et PURE (aucun import natif → testable sous Jest).
 *
 * On génère de petits effets sonores (ding, buzz, tic, fanfare) à la volée sous
 * forme de fichiers WAV PCM 16 bits mono, encodés en base64. Aucun fichier audio
 * n'est donc embarqué dans l'app : `sounds.ts` écrit ces WAV dans le cache et les
 * joue via expo-audio.
 */

/** Une note à mixer : fréquence, début et durée (s), gain, et harmoniques. */
export interface Note {
  freq: number;
  /** Début de la note en secondes. */
  start: number;
  /** Durée en secondes. */
  dur: number;
  /** Volume relatif (0..1). */
  gain?: number;
  /** Poids des harmoniques (1er = fondamentale). Défaut : timbre de cloche. */
  partials?: number[];
  /** Vitesse de décroissance exponentielle (plus grand = plus court). */
  decay?: number;
}

const DEFAULT_PARTIALS = [1, 0.5, 0.25];

/**
 * Rend une séquence de notes en échantillons flottants [-1, 1]. Chaque note a
 * une attaque brève et une décroissance exponentielle (timbre percussif/cloche).
 */
export function renderSequence(notes: Note[], sampleRate: number): number[] {
  const end = notes.reduce((m, n) => Math.max(m, n.start + n.dur), 0);
  const total = Math.max(1, Math.ceil(end * sampleRate));
  const out = new Array<number>(total).fill(0);
  const attack = 0.004; // 4 ms
  for (const n of notes) {
    const gain = n.gain ?? 0.25;
    const partials = n.partials ?? DEFAULT_PARTIALS;
    const decay = n.decay ?? 6;
    const startSample = Math.floor(n.start * sampleRate);
    const durSamples = Math.floor(n.dur * sampleRate);
    for (let i = 0; i < durSamples; i += 1) {
      const idx = startSample + i;
      if (idx < 0 || idx >= total) continue;
      const t = i / sampleRate;
      const atk = t < attack ? t / attack : 1;
      const env = atk * Math.exp(-decay * t);
      let s = 0;
      for (let h = 0; h < partials.length; h += 1) {
        s += (partials[h] ?? 0) * Math.sin(2 * Math.PI * n.freq * (h + 1) * t);
      }
      out[idx] = (out[idx] ?? 0) + gain * env * s;
    }
  }
  // Limiteur doux pour éviter l'écrêtage quand des notes se superposent.
  for (let i = 0; i < out.length; i += 1) {
    const v = out[i] ?? 0;
    out[i] = Math.max(-1, Math.min(1, v));
  }
  return out;
}

/** Encode des échantillons [-1,1] en WAV PCM 16 bits mono (octets bruts). */
export function encodeWavPcm16(samples: number[], sampleRate: number): Uint8Array {
  const dataLen = samples.length * 2;
  const buf = new Uint8Array(44 + dataLen);
  const view = new DataView(buf.buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i += 1) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLen, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // taille du bloc fmt
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // débit d'octets
  view.setUint16(32, 2, true); // alignement bloc
  view.setUint16(34, 16, true); // bits par échantillon
  writeStr(36, 'data');
  view.setUint32(40, dataLen, true);
  let off = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(off, Math.round(s * 32767), true);
    off += 2;
  }
  return buf;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Encode des octets en base64 (pur, sans dépendance à Buffer/atob). */
export function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = ((bytes[i] as number) << 16) | ((bytes[i + 1] as number) << 8) | (bytes[i + 2] as number);
    out += B64[(n >> 18) & 63]! + B64[(n >> 12) & 63]! + B64[(n >> 6) & 63]! + B64[n & 63]!;
  }
  const rem = bytes.length - i;
  if (rem === 1) {
    const n = (bytes[i] as number) << 16;
    out += B64[(n >> 18) & 63]! + B64[(n >> 12) & 63]! + '==';
  } else if (rem === 2) {
    const n = ((bytes[i] as number) << 16) | ((bytes[i + 1] as number) << 8);
    out += B64[(n >> 18) & 63]! + B64[(n >> 12) & 63]! + B64[(n >> 6) & 63]! + '=';
  }
  return out;
}

/** Rend une séquence directement en WAV base64 (raccourci pratique). */
export function sequenceToWavBase64(notes: Note[], sampleRate = 22050): string {
  return bytesToBase64(encodeWavPcm16(renderSequence(notes, sampleRate), sampleRate));
}
