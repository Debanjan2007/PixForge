import { createClient } from "redis";
import type { RedisClientType } from "redis";

let client : RedisClientType

const connectToClient = async (redisUrl : string) => {
    if(!redisUrl) throw new Error("REDIS_URL not defined")
    client = createClient({url: redisUrl})
    client.connect().then(() => {
        console.log("redis Connection done");
    })
        .catch((err) => {
            console.log("Error came while connect", err);
        })
    client.on('connect', () => {
        console.log("client is now connected");
    })
    client.on('error', (err) => {
        throw new Error("Error occured in redis connection", { cause: err })
    })
}

export {
    client,
    connectToClient
}