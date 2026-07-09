export interface ServerPlaytimeInterface {
    serverName: string;
    playtime: number;
}

export interface EventStatsInterface {
    total: number;
    averagePerSession: number | null;
    perServer: { serverName: string; count: number }[];
}

export default interface SessionStatsInterface {
    activeSince: number | null;
    totalPlaytime: number;
    distinctServers: number;
    sessionCount: number;
    averageSessionPlaytime: number | null;
    favouriteServer: ServerPlaytimeInterface | null;
    advancements: EventStatsInterface;
    deaths: EventStatsInterface;
}
