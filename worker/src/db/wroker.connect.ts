import { Worker } from 'bullmq'
import { uploadImage , delimageHandle } from '../controller/queue.worker.controller.js'

let worker : Worker
const workerConnet = async () => {
    worker = new Worker('image-upload', async (job) => {
        switch(job.name){
            case 'uploadImage' :
                console.log("Uploading image")
                await uploadImage(job.data as string)
                break
            case 'deleteImage' :
                await delimageHandle(job.data[0].fileId as string , job.data[0].imageId as string)
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