import { bytesToBase64, encodeWavPcm16, renderSequence, sequenceToWavBase64 } from './wav';

describe('wav', () => {
  describe('bytesToBase64', () => {
    const enc = (s: string) => bytesToBase64(new Uint8Array([...s].map((c) => c.charCodeAt(0))));
    it('encode sans padding (multiple de 3)', () => {
      expect(enc('Man')).toBe('TWFu');
    });
    it('encode avec un « = » (reste 2)', () => {
      expect(enc('Ma')).toBe('TWE=');
    });
    it('encode avec deux « = » (reste 1)', () => {
      expect(enc('M')).toBe('TQ==');
    });
    it('gère un tableau vide', () => {
      expect(bytesToBase64(new Uint8Array([]))).toBe('');
    });
  });

  describe('encodeWavPcm16', () => {
    it('produit un en-tête WAV correct et la bonne taille', () => {
      const bytes = encodeWavPcm16([0, 0.5, -0.5, 1, -1], 22050);
      expect(bytes.length).toBe(44 + 5 * 2);
      const str = (off: number, len: number) =>
        String.fromCharCode(...Array.from(bytes.slice(off, off + len)));
      expect(str(0, 4)).toBe('RIFF');
      expect(str(8, 4)).toBe('WAVE');
      expect(str(12, 4)).toBe('fmt ');
      expect(str(36, 4)).toBe('data');
      // sample rate en little-endian à l'offset 24
      const view = new DataView(bytes.buffer);
      expect(view.getUint32(24, true)).toBe(22050);
      expect(view.getUint16(22, true)).toBe(1); // mono
      expect(view.getUint16(34, true)).toBe(16); // 16 bits
    });

    it('écrête les valeurs hors [-1, 1]', () => {
      const bytes = encodeWavPcm16([2, -2], 8000);
      const view = new DataView(bytes.buffer);
      expect(view.getInt16(44, true)).toBe(32767);
      expect(view.getInt16(46, true)).toBe(-32767);
    });
  });

  describe('renderSequence', () => {
    it('a une longueur = ceil(fin * sampleRate)', () => {
      const samples = renderSequence([{ freq: 440, start: 0, dur: 0.1 }], 1000);
      expect(samples.length).toBe(100);
    });
    it('tient compte du décalage de départ', () => {
      const samples = renderSequence([{ freq: 440, start: 0.05, dur: 0.1 }], 1000);
      // ~150 échantillons (à ±1 près, tolérance flottante sur start+dur).
      expect(samples.length).toBeGreaterThanOrEqual(150);
      expect(samples.length).toBeLessThanOrEqual(151);
      // Avant le début (< 50 échantillons), silence.
      expect(samples[0]).toBe(0);
      expect(samples[49]).toBe(0);
    });
    it('reste borné dans [-1, 1]', () => {
      const samples = renderSequence(
        [
          { freq: 300, start: 0, dur: 0.2, gain: 1, partials: [1, 1, 1] },
          { freq: 600, start: 0, dur: 0.2, gain: 1, partials: [1, 1, 1] },
        ],
        4000,
      );
      for (const s of samples) expect(Math.abs(s)).toBeLessThanOrEqual(1);
    });
  });

  it('sequenceToWavBase64 renvoie une chaîne base64 non vide', () => {
    const b64 = sequenceToWavBase64([{ freq: 660, start: 0, dur: 0.1 }], 8000);
    expect(typeof b64).toBe('string');
    expect(b64.length).toBeGreaterThan(0);
    expect(/^[A-Za-z0-9+/]*={0,2}$/.test(b64)).toBe(true);
  });
});
