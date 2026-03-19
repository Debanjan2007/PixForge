import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { app } from './app.js'
import { connectDB , getDBStatus } from 'devdad-express-utils'
import {
    S3Client,
    ListBucketsCommand,
    CreateBucketCommand
} from '@aws-sdk/client-s3'
import { bucketExists } from './src/utils/bucketExist.util.js'
import { connectToClient } from './src/db/redis.db.connect.js'
import { workerConnet } from './src/db/worker.connect.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') }) 
const port = process.env.PORT
const s3client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT as string,
    region: process.env.MINIO_REGION as string,
    credentials: {
        accessKeyId: process.env.MINIO_ROOT_USERNAME as string,
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD as string,
    },
    forcePathStyle: true
})


connectDB()
.then(async () => {
    getDBStatus()
    await workerConnet()
    const bucket : boolean = await bucketExists(process.env.BUCKET_NAME as string)
    if(!bucket){
        await s3client.send(
            new CreateBucketCommand({
                Bucket: process.env.BUCKET_NAME
            })
        )
    }
    const s3lists = await s3client.send(new ListBucketsCommand({}))
    console.log("The s3 client has been initialised successfully",s3lists);
    await connectToClient(process.env.REDIS_URL as string)
    app.listen(port , () => {
        console.log(`Image processing service is now running on http://localhost:${port}`);        
    })
})
.catch((err) => {
    console.error(`Image processing start up failed ${err}`);    
    process.exit(1)
})
export {
    s3client
}