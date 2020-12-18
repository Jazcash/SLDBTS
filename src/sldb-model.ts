export module SLDBModel {
    export interface Request {
        username: string;
        password: string;
    }
    
    export interface Response {
        status: 0 | 1 | 2;
        results?: Result[];
        result?: Result;
    }

    export interface Result {
    }

    export interface PlayerSkillResult extends Result {
        skills: { [key in GameType]?: Skill };
        accountId: number;
        privacyMode: number;
    }

    export interface MatchResult extends Result {
        gameId: string;
        gameType: GameType;
        players: PlayerSkillChange[];
    }

    export interface LeaderboardResult extends Result {
        gameType: GameType;
        players: LeaderboardPlayer[];
    }

    export interface PlayerStatsResult extends Result {
        wins: { [key in GameType]: number };
        losses: { [key in GameType]: number };
        undecided: { [key in GameType]: number; };
    }

    export interface LeaderboardPlayer {
        accountId: number;
        name: string;
        estimatedSkill: number;
        uncertainty: number;
        trustedSkill: number;
    }

    export interface PlayerSkillChange {
        skills: SkillChange;
        accountId: number;
        privacyMode: number;
    }

    export interface SkillChange {
        before: Skill;
        after: Skill;
    }

    export interface Skill {
        estimated: number;
        uncertainty: number;
        trusted: number;
    }

    export type GameType = "Duel" | "FFA" | "Team" | "TeamFFA" | "Global";
}