import mc from 'minecraft-protocol';
export default defineEventHandler(async (event): Promise<McStatsResultInterface> => {
    try {
        const result = await mc.ping({
            host: (getQuery(event).host ?? '').toString()
        });
        if ('players' in result) {
            return {
                online: true,
                playersOnline: result.players.online,
                playersMax: result.players.max,
            }
        }
        return {
            online: true,
            playersOnline: result.playerCount,
            playersMax: result.maxPlayers,
        }
    } catch (exception) {
        return {
            online: false,
            playersOnline: null,
            playersMax: null,
        }
    }
})