import { client } from "./redis.db.connect.js";
import { Queue } from "bullmq";

// bullmq connection established
const queue = new Queue('image-upload' , {
    connection: {
        url: process.env.REDIS_URL as string // url of redis for connecting with redis channel
    }
})
// add jobs to controller via this function
const addJob = async (jobName : string , jobContent: any )=> {
    await queue.add(jobName , jobContent)
}
export {
    queue ,
    addJob
}