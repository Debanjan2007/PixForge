import { createClient } from 'redis'

let client: ReturnType<typeof createClient> | undefined

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
        console.log('Redis client connected');
    } catch (err) {
        console.error('Failed to connect Redis:', err);
    }
}
export {
    client,
    connectToClient
}