import { createClient } from 'redis'
import { Queue, Worker, Job } from 'bullmq'
import { delimageHandle } from '../../queue/queue.worker.controller.js'

let client: ReturnType<typeof createClient> | undefined
let publisher : Queue | null = null
let worker = null;

const connectToClient = async (url: string , redisPass: string) => {
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
        publisher = new Queue('imagequeue', {
            connection: {
                host: (client?.options.socket as any)?.host || 'localhost',
                port: (client?.options.socket as any)?.port || 6379,
                password: redisPass
            }
        })
        publisher.on('waiting', () => {
            console.log("Job is waiting to be processed");
        })
        publisher.on('progress', () => {
            console.log("Job's progress updated");
        })
        publisher.on('error', (err) => {
            console.log(`Error occured while queue jobs ${err}`);
        })
        worker = new Worker('imagequeue', async (job: Job) => {
            switch (job.name) {
                case 'delimage':
                    const imgdeleted = await delimageHandle(job.data.fieldId as string)
                    if(imgdeleted === false){
                        throw new Error("image isn't deleted yet")
                    }
                    break;
                default:
                    console.log("helo");
                    break;
            }
        },
            {
                connection: {
                    host: (client?.options.socket as any)?.host || 'localhost',
                    port: (client?.options.socket as any)?.port || 6379,
                    password: redisPass
                },
                removeOnComplete: {
                    age: 3600, // keep up to 1 hour
                    count: 1000, // keep up to 1000 jobs
                },
                removeOnFail: {
                    age: 24 * 3600, // keep up to 24 hours
                }
            }
        )
        worker.on('completed' , () => {
            console.log("Job is done");            
        })
        worker.on('failed' , (err) => {
            console.log("job is failed!" , err);            
        })
        console.log('Redis client connected');
    } catch (err) {
        console.error('Failed to connect Redis:', err);
    }
}
export {
    client,
    connectToClient,
    publisher
}