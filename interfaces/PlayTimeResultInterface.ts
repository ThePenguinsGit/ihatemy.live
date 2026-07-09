import type PlaytimeRowInterface from "./PlaytimeRowInterface";
import type { DonationTier } from "~/data/donationTiers";

export default interface PlayTimeResultInterface {
    uuid: string,
    userName: string,
    displayName: string | null,
    playTimes: PlaytimeRowInterface[],
    currentLevel: number,
    playTimeSum: number,
    timeForCurrentLevel: number,
    timeToNextLevel: number,
}