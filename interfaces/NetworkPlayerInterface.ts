export default interface NetworkPlayerInterface {
    uuid: string,
    // Minecraft name last joined with; null if never seen.
    name: string | null,
    // Nickname as plain text, else the name.
    displayName: string | null,
    online: boolean,
    // Short name of the server the player is on; null when offline.
    server: string | null,
}
