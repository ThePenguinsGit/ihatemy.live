// Donation tiers and the nickname-editor features they unlock.
// Source of truth for the paywall matrix is content/docs/donations/index.md;
// this mirrors it as structured data so the editor can gate + upsell.

export type DonationTier =
  | 'contributor'
  | 'server-preserver'
  | 'booster'
  | 'stellar-sponsor'
  | 'booty-benefactor'
  | 'server-sorcerer'
  | 'angel-investor'
  | 'founder';

export interface DonationTierMeta {
  id: DonationTier;
  name: string;
  rank: number;      // 0 = lowest; higher unlocks everything below
  image?: string;    // public/ path, where artwork exists
}

// Ordered lowest → highest.
export const donationTiers: DonationTierMeta[] = [
  { id: 'contributor', name: 'Contributor', rank: 0 },
  { id: 'server-preserver', name: 'Server Preserver', rank: 1, image: '/img/docs/tiers/preserver.png' },
  { id: 'booster', name: 'Discord Booster', rank: 2 },
  { id: 'stellar-sponsor', name: 'Stellar Sponsor', rank: 3, image: '/img/docs/tiers/sponsor.png' },
  { id: 'booty-benefactor', name: 'Booty Benefactor', rank: 4, image: '/img/docs/tiers/booty.png' },
  { id: 'server-sorcerer', name: 'Server Sorcerer', rank: 5, image: '/img/docs/tiers/sorcerer.png' },
  { id: 'angel-investor', name: 'Angel Investor', rank: 6, image: '/img/docs/tiers/angel.png' },
  { id: 'founder', name: 'Founder', rank: 7 },
];

const byId = new Map(donationTiers.map((t) => [t.id, t]));

export const tierMeta = (tier: DonationTier | null): DonationTierMeta | null =>
  tier ? byId.get(tier) ?? null : null;

export const tierRank = (tier: DonationTier | null): number =>
  tier ? byId.get(tier)?.rank ?? -1 : -1;

// Nickname features and the minimum tier rank that unlocks each.
// (Rainbow is grouped with gradient per product decision.)
export type NickFeature = 'color' | 'format' | 'gradient';

export const nickFeatureMinRank: Record<NickFeature, number> = {
  color: 0,    // Contributor+
  format: 2,   // Discord Booster+
  gradient: 5, // Server Sorcerer+ (gradient & rainbow)
};

/** Whether a tier unlocks a nickname feature. */
export const unlocks = (tier: DonationTier | null, feature: NickFeature): boolean =>
  tierRank(tier) >= nickFeatureMinRank[feature];

/** Lowest tier that unlocks a feature — used for upsell copy. */
export const minTierFor = (feature: NickFeature): DonationTierMeta =>
  donationTiers.find((t) => t.rank === nickFeatureMinRank[feature])!;
