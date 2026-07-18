import type { ComponentType } from 'react';

import type { Player, SessionResult } from '../core/models';

/**
 * The mini-game plugin contract.
 *
 * A mini-game is just a definition that provides two components: one to
 * configure a round and one to play it. Generic navigator screens render these,
 * so games know nothing about navigation, persistence or stats — they only emit
 * a `SessionResult` when finished. Add a game by creating these two components
 * and registering the definition in registry.ts.
 */

export interface MiniGameConfigProps {
  players: Player[];
  /** Called when the user validates the configuration and wants to start. */
  onStart: (config: unknown) => void;
  onCancel: () => void;
}

export interface MiniGamePlayProps {
  players: Player[];
  config: unknown;
  /** Called once when the game is over with the result to persist. */
  onFinish: (result: SessionResult) => void;
  /** Called when the user leaves the game (nothing is saved to stats). */
  onQuit: () => void;
  /** Resume a previously saved in-progress game instead of starting a new one. */
  resume?: boolean;
  /** Save-slot id to bind this play session to (resume uses it; new games get their own). */
  slotId?: string;
}

export interface MiniGameDefinition {
  id: string;
  title: string;
  emoji: string;
  description: string;
  minPlayers: number;
  /** Coming-soon games can be listed but not yet playable. */
  available: boolean;
  ConfigComponent: ComponentType<MiniGameConfigProps>;
  PlayComponent: ComponentType<MiniGamePlayProps>;
}
