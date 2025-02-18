import type PlaytimeRowInterface from "./PlaytimeRowInterface";

export default interface PlayTimeResultInterface {
    userName: string,
    playTimes: PlaytimeRowInterface[],
    currentLevel: number,
    playTimeSum: number,
    timeToNextLevel: number,
}