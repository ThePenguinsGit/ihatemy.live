export default interface GalleryEntryInterface {
    messageId: string,
    authorId: string,
    authorUsername: string,
    authorAvatarUrl: string,
    content: string,
    voteCount: number,
    images: string[],
    createdAt: number,
    updatedAt: number,
}
