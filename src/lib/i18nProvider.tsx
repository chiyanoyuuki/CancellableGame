import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { kvGetJSON, kvSetJSON } from '../db';
import { detectDeviceLang, type Lang, setModuleLang, t } from './i18n';

/**
 * Provider React pour la langue de l'interface. Calqué sur `TextScaleProvider` :
 * la valeur est persistée en base (kv) et exposée par contexte. Comme tout
 * composant affichant du texte appelle `useT()` (donc `useContext`), un
 * changement de langue re-rend instantanément l'ensemble des écrans montés —
 * pas besoin de remonter la navigation.
 */

const KEY = 'ui:lang';

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const I18nContext = createContext<I18nValue>({ lang: 'fr', setLang: () => undefined });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const d = detectDeviceLang();
    setModuleLang(d);
    return d;
  });

  useEffect(() => {
    void kvGetJSON<Lang | null>(KEY, null)
      .then((saved) => {
        if (saved === 'fr' || saved === 'en') {
          setModuleLang(saved);
          setLangState(saved);
        }
      })
      .catch(() => undefined);
  }, []);

  const setLang = (l: Lang) => {
    setModuleLang(l);
    setLangState(l);
    void kvSetJSON(KEY, l);
  };

  return <I18nContext.Provider value={{ lang, setLang }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

/**
 * Hook renvoyant une fonction `t` liée à la langue active. Le composant qui
 * l'utilise se re-rend automatiquement au changement de langue.
 */
export function useT(): (fr: string, params?: Record<string, string | number>) => string {
  const { lang } = useI18n();
  return useMemo(() => (fr: string, params?: Record<string, string | number>) => t(fr, params, lang), [lang]);
}
