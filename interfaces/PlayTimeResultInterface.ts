import type PlaytimeRowInterface from "./PlaytimeRowInterface";

export default interface PlayTimeResultInterface {
    uuid: string,
    userName: string,
    playTimes: PlaytimeRowInterface[],
    currentLevel: number,
    playTimeSum: number,
    timeToNextLevel: number,
}