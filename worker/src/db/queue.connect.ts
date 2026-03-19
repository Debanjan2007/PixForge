import { Queue } from 'bullmq';
// queue to change the status of the image
const queue = new Queue('processed-image' , {
    connection: {
        url: process.env.REDIS_URL as string // url of redis for connecting with redis channel
    }
})
export {
    queue
}