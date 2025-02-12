export interface PlayerInfo {
  steamID64: string;
  name?: string;
  profileLink?: string;
  avatarLink?: string;
  lastPlayWith?: string;
  banInfo?: BanInfo;
  matches: string[];
  deleted?: boolean;
}

export interface PlayerScore {
  steamID64: string;
  ping: string | null;
  k: string | null;
  a: string | null;
  d: string | null;
  mvp: string | null;
  hsp: string | null;
  score: string | null;
}

export interface TeamInfo {
  scores: PlayerScore[];
  score?: number;
  win?: number;
}

export interface MatchInfo {
  id?: string;
  section?: string;
  map?: string;
  format?: MatchFormat;
  overtime?: boolean;
  finished?: boolean;
  teamA?: TeamInfo;
  teamB?: TeamInfo;
  replayLink?: string;
  playersSteamID64: string[];
}

export interface Database {
  apiKey?: string;
  hideHistoryTable?: boolean;
  players: PlayerInfo[];
  matches: MatchInfo[];
}

export enum MatchFormat {
  MR12 = 'MR12',
  MR8 = 'MR8',
  MR15 = 'MR15',
}

/**
 * This is from Steam API Results
 */
export interface BanInfo {
  CommunityBanned: boolean;
  DaysSinceLastBan: number;
  EconomyBan: string;
  NumberOfGameBans: number;
  NumberOfVACBans: number;
  SteamId: string;
  VACBanned: boolean;

  /** approximative date of ban */
  LastBanOn: string;
  /** this one is not from Steam API. To know when the last scan occured. */
  LastFetch: string;
}
