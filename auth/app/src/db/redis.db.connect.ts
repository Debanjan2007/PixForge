import { createClient  } from "redis";
import type { RedisClientType  } from "redis";
import app from "../../app.js";
let client : RedisClientType

const connecttoRedis = async (redisUrl : string) => {
    if (!redisUrl) {
        throw new Error("REDIS_URL not defined");
    }
    client  = createClient({
        url: redisUrl,
    });
    client.connect().then(() => {
        console.log("Redis client is connected")
    }).catch((err) => {
        console.log("Redis client connection failed", err);
    })
    client.on("connect", () => {
        console.log("Redis connected");
    });

    client.on("error", (err) => {
        console.error("Redis error:", err);
    });
}
export {
    client ,
    connecttoRedis
}