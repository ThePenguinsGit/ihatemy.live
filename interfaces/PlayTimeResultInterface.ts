import type PlaytimeRowInterface from "./PlaytimeRowInterface";

export default interface PlayTimeResultInterface {
    uuid: string,
    userName: string,
    displayName: string | null,
    playTimes: PlaytimeRowInterface[],
    currentLevel: number,
    playTimeSum: number,
    timeToNextLevel: number,
}