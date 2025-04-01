export default interface McStatsResultInterface {
    online: boolean,
    players: {
        max: number,
        online: number,
    }
}