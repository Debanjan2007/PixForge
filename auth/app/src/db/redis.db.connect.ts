import { createClient } from "redis";

const client = createClient({url: process.env.REDIS_URL as string})

const connectToClient = async () => {
    console.log(process.env.REDIS_URL);
    console.log( process.env.REDIS_PASS as string);    
    client.connect().then(() => {
        console.log("Connection done");
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