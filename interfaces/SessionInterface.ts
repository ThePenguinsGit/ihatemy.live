export default interface SessionInterface {
    id: string;
    userId: string;
    serverName: string;
    /** Unix seconds */
    start: number;
    /** Unix seconds, or null while the session is still active */
    end: number | null;
    /** Unix seconds */
    updatedAt: number;
    migrated: boolean;
    /** Number of ADVANCEMENT events recorded in this session. */
    advancementCount: number;
    /** Number of DEATH events recorded in this session. */
    deathCount: number;
}
