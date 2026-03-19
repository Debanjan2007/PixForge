import { Worker } from 'bullmq'
import type {processedImageJob} from "../types/api.types.js";
import { updateImageProcessedUrl } from "../controller/worker.controller.js";

let worker : Worker
const workerConnet = async () => {
    worker = new Worker('processed-image', async (job) => {
        switch(job.name){
            case 'processed' :
                console.log("Updating image processed url")
                await updateImageProcessedUrl(job.data as processedImageJob)
                break
            default :
                console.log("Job not found")
                break
        }
    } , {
        connection: {
            url: process.env.REDIS_URL as string
        }
    })
}

process.on('SIGINT' , () => {
    worker.close().then( () => {
            console.log("Connection closing....")
        }
    ).catch(err => {
        console.log("Error while closing connection", err)
    })
    process.exit(0)
})

export {
    workerConnet
}