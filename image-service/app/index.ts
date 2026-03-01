import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { app } from './app.js'
import { connectDB , getDBStatus } from 'devdad-express-utils'
import {
    S3Client,
    ListBucketsCommand
} from '@aws-sdk/client-s3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') }) 
const port = process.env.PORT
let s3client : any;


connectDB()
.then(async () => {
    getDBStatus()
    s3client = new S3Client({
        endpoint: process.env.MINIO_ENDPOINT as string,
        region: process.env.MINIO_REGION as string,
        credentials: {
            accessKeyId: process.env.MINIO_ROOT_USERNAME as string,
            secretAccessKey: process.env.MINIO_ROOT_PASSWORD as string,
        }
    })
    const s3lists = await s3client.send(new ListBucketsCommand({}))
    console.log("The s3 client has been initialised successfully",s3lists);    
    app.listen(port , () => {
        console.log(`Image processing service is now running on http://localhost:${port}`);        
    })
})
.catch((err) => {
    console.error(`Image processing start up failed ${err}`);    
    process.exit(1)
})