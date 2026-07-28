export default interface GalleryEntryInterface {
    messageId: string,
    authorId: string,
    authorUsername: string,
    authorAvatarUrl: string,
    content: string,
    /** Server-rendered escape-complete HTML of `content` (see rendering-discord-markup.md); '' until the entry is re-synced. */
    contentHtml: string,
    voteCount: number,
    images: string[],
    createdAt: number,
    updatedAt: number,
}
