export type CosmeticType = 'JOIN_MESSAGE' | 'LEAVE_MESSAGE' | 'SOUND' | 'BADGE';

export default interface CosmeticItemInterface {
    id: string,
    type: CosmeticType,
    // The type as it's called in game, e.g. "Join".
    typeName: string,
    // MiniMessage source of the name.
    name: string,
    // MiniMessage badge or join/leave line, or the vanilla sound key for a SOUND.
    content: string,
    // In tokens; 0 when it isn't sold.
    price: number,
    // Key of the achievement that grants the item.
    achievement: string | null,
    owned: boolean,
    selected: boolean,
    // Rendered by the backend; null when the renderer didn't answer.
    nameHtml: string | null,
    // Null for a sound, or when the renderer didn't answer.
    contentHtml: string | null,
    // For a SOUND: the files the game may play for it, on Mojang's resource
    // server. Null for anything else, or when Mojang couldn't be reached.
    preview: SoundFileInterface[] | null,
}

// One file a sound may play, as Minecraft would play it.
export interface SoundFileInterface {
    url: string,
    // Played faster (above 1) or slower, which also raises or lowers it.
    pitch: number,
    volume: number,
    // How likely this file is against the others.
    weight: number,
}

export interface CosmeticBalanceInterface {
    amount: number,
    tokenName: string,
}
