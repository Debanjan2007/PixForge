import {Queue} from "bullmq";

// bullmq connection established
const queue = new Queue('image-upload' , {
    connection: {
        url: process.env.REDIS_URL as string // url of redis for connecting with redis channel
    }
})
// // dead letter queue
// const dlq = new Queue('image-upload-dlq' , {
//     connection: {
//         url: process.env.REDIS_URL as string
//     }
// })
// add jobs to controller via this function
const addJob = async (jobName : string , jobContent: any )=> {
    await queue.add(jobName , jobContent , {
        attempts: 5,
        backoff:{
            type: 'exponential',
            delay: 1000 * 60 * 2 // 2 minutes
        },
        removeOnComplete: true
    })
}
export {
    queue ,
    addJob
}