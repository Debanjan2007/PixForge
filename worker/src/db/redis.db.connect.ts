import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
let redisClient : RedisClientType

const connectClient = async (redisUrl : string) => {
    redisClient = createClient({url: redisUrl})
    redisClient.connect().then(() => {
        console.log("redis Connection done");
    })
        .catch((err) => {
            console.log("Error came while connect", err);
        })
    redisClient.on('connect', () => {
        console.log("client is now connected");
    })
    redisClient.on('error', (err) => {
        throw new Error("Error occured in redis connection", { cause: err })
    })
}


export {
    redisClient ,
    connectClient
}