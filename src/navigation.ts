import type { Player, SessionResult } from './core/models';

/** Route params for the root navigator. All values are JSON-serialisable. */
export type RootStackParamList = {
  Home: undefined;
  Players: undefined;
  GameSelect: undefined;
  Lobby: { gameId: string };
  GameConfig: { gameId: string; players: Player[] };
  GamePlay: { gameId: string; players: Player[]; config: unknown };
  Results: { result: SessionResult; players: Player[] };
  Stats: undefined;
  Settings: undefined;
  CustomContent: undefined;
};
