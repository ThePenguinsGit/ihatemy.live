export default interface SessionInterface {
    id: string;
    userId: string;
    serverName: string;
    /** Unix seconds */
    start: number;
    /** Unix seconds */
    end: number;
    /** Unix seconds */
    updatedAt: number;
    migrated: boolean;
}
