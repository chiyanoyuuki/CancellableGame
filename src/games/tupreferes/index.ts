import type { MiniGameDefinition } from '../types';
import { TuPreferesConfigComponent } from './TuPreferesConfig';
import { TuPreferesPlayComponent } from './TuPreferesPlay';

export const tuPreferesGame: MiniGameDefinition = {
  id: 'tupreferes',
  title: 'Tu préfères ?',
  emoji: '🤔',
  description:
    'Un dilemme, deux options, aucune bonne réponse. Chacun vote en secret, on révèle le partage — et le camp minoritaire trinque. Débats garantis.',
  minPlayers: 2,
  available: true,
  ConfigComponent: TuPreferesConfigComponent,
  PlayComponent: TuPreferesPlayComponent,
};
