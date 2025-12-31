import { createClient } from 'redis'
import { Queue } from 'bullmq'

let client: ReturnType<typeof createClient> | undefined
let publisher = null

const connectToClient = async (url: string) => {
    console.log('Connecting to Redis, url=', url);
    client = createClient({ url })
    client.on('connect', () => {
        console.log('Redis socket connected');
    })
    client.on('error', (error) => {
        console.error('Redis client error:', error);
    })
    client.on('ready', () => console.log('Redis client ready'));
    client.on('end', () => console.log('Redis client disconnected'));

    try {
        await client.connect()
        publisher = new Queue('imagequeue' , {
            connection:{
                host: (client?.options.socket as any)?.host || 'localhost' ,
                port: (client?.options.socket as any)?.port || 6379
            }
        })
        console.log('Redis client connected');
    } catch (err) {
        console.error('Failed to connect Redis:', err);
    }
}
export {
    client,
    connectToClient ,
    publisher
}