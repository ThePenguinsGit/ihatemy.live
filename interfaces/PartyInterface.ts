import type NetworkPlayerInterface from '~/interfaces/NetworkPlayerInterface';

export interface PartyInviteInterface {
    partyId: string,
    // Who is invited.
    player: NetworkPlayerInterface,
    invitedBy: NetworkPlayerInterface,
    // When it was made; invites stay open until answered or the party ends.
    createdAt: string,
}

export default interface PartyInterface {
    id: string,
    // In the order they joined.
    members: NetworkPlayerInterface[],
    // Open invitations the party has out, oldest first.
    invites: PartyInviteInterface[],
}
