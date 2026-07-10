export interface JwtPayload {
    id: string,
    name: string,
    avatar: string,
    donatorGroup: string|null,
}