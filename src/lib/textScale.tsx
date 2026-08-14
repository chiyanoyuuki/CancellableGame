import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { kvGetJSON, kvSetJSON } from '../db';

/**
 * Échelle globale de la taille du texte (accessibilité). Un contexte léger : la
 * valeur est persistée en base (kv) et lue par le composant `Txt`, si bien que
 * tout le texte de l'app grandit ou rapetisse d'un coup. Bornée pour ne jamais
 * casser les mises en page.
 */

const KEY = 'ui:textScale';
export const MIN_SCALE = 0.85;
export const MAX_SCALE = 1.4;

export function clampScale(s: number): number {
  if (!Number.isFinite(s)) return 1;
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
}

interface TextScaleValue {
  scale: number;
  setScale: (s: number) => void;
}

const TextScaleContext = createContext<TextScaleValue>({ scale: 1, setScale: () => undefined });

export function TextScaleProvider({ children }: { children: ReactNode }) {
  const [scale, setScaleState] = useState(1);

  useEffect(() => {
    void kvGetJSON<number>(KEY, 1).then((s) => setScaleState(clampScale(s)));
  }, []);

  const setScale = (s: number) => {
    const c = clampScale(s);
    setScaleState(c);
    void kvSetJSON(KEY, c);
  };

  return <TextScaleContext.Provider value={{ scale, setScale }}>{children}</TextScaleContext.Provider>;
}

export function useTextScale(): TextScaleValue {
  return useContext(TextScaleContext);
}
