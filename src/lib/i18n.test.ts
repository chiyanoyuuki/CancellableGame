import { detectDeviceLang, t } from './i18n';

describe('i18n', () => {
  it('renvoie le français tel quel', () => {
    expect(t('Nouvelle partie', undefined, 'fr')).toBe('Nouvelle partie');
  });

  it('traduit en anglais quand une entrée existe', () => {
    expect(t('Nouvelle partie', undefined, 'en')).toBe('New game');
  });

  it("retombe sur le français quand la traduction anglaise est absente", () => {
    const orphan = 'Chaîne jamais traduite ' + Math.random();
    expect(t(orphan, undefined, 'en')).toBe(orphan);
  });

  it('interpole les gabarits {clef} dans les deux langues', () => {
    expect(t('Choisis encore {n} univers', { n: 3 }, 'fr')).toBe('Choisis encore 3 univers');
    expect(t('Choisis encore {n} univers', { n: 3 }, 'en')).toBe('Choose 3 more universes');
  });

  it('laisse les gabarits inconnus intacts', () => {
    expect(t('Valeur {x}', { y: 1 }, 'fr')).toBe('Valeur {x}');
  });

  it('détecte une langue valide', () => {
    expect(['fr', 'en']).toContain(detectDeviceLang());
  });
});
