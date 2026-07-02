import type { Question } from '../../../core/models';

/**
 * BLIND TEST 🎧
 *
 * Le moteur lit l'audio via le champ `media` de type 'audio', soit :
 *   media: { type: 'audio', uri: 'https://.../extrait.mp3' }   // distant
 *   media: { type: 'audio', module: require('../../../../assets/audio/x.mp3') } // embarqué (hors-ligne, conseillé)
 *
 * IMPORTANT :
 * - Les extraits ci-dessous sont des DÉMOS libres de droits (SoundHelix) qui
 *   servent juste à vérifier que la lecture fonctionne. Remplacez-les par vos
 *   propres extraits (intros de chansons, génériques de séries, etc.).
 * - N'utilisez que des extraits dont vous avez le droit de vous servir.
 * - Pour des extraits embarqués et jouables hors-ligne, déposez vos .mp3 dans
 *   assets/audio/ et utilisez `module: require('../../../../assets/audio/...')`.
 * - Le thème « blindtest » est désactivé par défaut (cf. DEFAULT_QUIZ_CONFIG) :
 *   activez-le dans la config quand vous voulez l'inclure.
 */
const demo = (n: number): { type: 'audio'; uri: string } => ({
  type: 'audio',
  uri: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`,
});

export const blindtestQuestions: Question[] = [
  {
    id: 'blind-demo-1',
    theme: 'blindtest',
    difficulty: 2,
    text: '🎧 DÉMO — écoute l\'extrait. De quel extrait s\'agit-il ?',
    answer: 'Extrait 1',
    distractors: ['Extrait 2', 'Extrait 3', 'Extrait 4'],
    media: demo(1),
  },
  {
    id: 'blind-demo-2',
    theme: 'blindtest',
    difficulty: 2,
    text: '🎧 DÉMO — écoute l\'extrait. De quel extrait s\'agit-il ?',
    answer: 'Extrait 2',
    distractors: ['Extrait 1', 'Extrait 3', 'Extrait 5'],
    media: demo(2),
  },
  {
    id: 'blind-demo-3',
    theme: 'blindtest',
    difficulty: 3,
    text: '🎧 DÉMO — écoute l\'extrait. De quel extrait s\'agit-il ?',
    answer: 'Extrait 3',
    distractors: ['Extrait 1', 'Extrait 2', 'Extrait 6'],
    media: demo(3),
  },
];
