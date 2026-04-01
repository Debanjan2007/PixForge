import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectClient } from './db/redis.db.connect.js'
import { workerConnet } from './db/wroker.connect.js'
import { ImageKit } from "@imagekit/nodejs";
import {
    S3Client,
    ListBucketsCommand
} from '@aws-sdk/client-s3'


// connecting to the .env file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })
// @ts-ignore
let imagekitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
})
const s3client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT as string,
    region: process.env.MINIO_REGION as string,
    credentials: {
        accessKeyId: process.env.MINIO_ROOT_USERNAME as string,
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD as string,
    },
    forcePathStyle: true
})

connectClient(process.env.REDIS_URL as string).then(() => {
    console.log("Redis connection established✅🚀");
    workerConnet().then(() => {
        console.log("Worker connection established✅");
    }).catch((err : any) => {
        console.log("Error while connecting to worker❌", err);
    })
})
.catch((err) => {
    console.log("Error while connecting to redis", err);
})

export {
    imagekitClient ,
    s3client
}