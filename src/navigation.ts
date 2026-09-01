import type { Player, SessionResult } from './core/models';

/** Route params for the root navigator. All values are JSON-serialisable. */
export type RootStackParamList = {
  Home: undefined;
  Players: undefined;
  PlayerProfile: { playerId: string };
  RemoteProfile: undefined;
  GameSelect: undefined;
  Lobby: { gameId: string };
  GameConfig: { gameId: string; players: Player[]; soiree?: boolean };
  GamePlay: { gameId: string; players: Player[]; config: unknown; resume?: boolean; slotId?: string; soiree?: boolean };
  Results: { result: SessionResult; players: Player[] };
  Soiree: undefined;
  DailyChallenge: { seed?: string } | undefined;
  SoloQuiz: { mode: 'survie' | 'chrono' };
  Roue: undefined;
  Revision: undefined;
  FaceAFace: undefined;
  Entrainement: undefined;
  Seasons: undefined;
  Qotd: undefined;
  Tournoi: undefined;
  TeamGenerator: undefined;
  Stats: undefined;
  AppStats: undefined;
  Settings: undefined;
  CustomContent: undefined;
  ImageCheck: undefined;
  ReportedQuestions: undefined;
  Store: undefined;
};
