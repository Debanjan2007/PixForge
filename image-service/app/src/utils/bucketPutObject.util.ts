import { PutObjectCommand } from "@aws-sdk/client-s3";
import {s3client} from "../../index.js";
import { v4 as uuidV4 } from 'uuid'
// Put or upload an object to a bucket.
const uploadObjectinBucket = async (bucketName : string, fileContent : any , fileExtension : string) => {
    try{
        const uniqueKey : string = `${uuidV4()}`
        const data = await s3client.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: uniqueKey ,
                Body: fileContent,
                ContentType: `image/${fileExtension}`,
                ContentDisposition: "inline",
            })
        )
        if(!data){
            return null
        }
        // console.log(`Put object to bucket successfully \n `,data , uniqueKey)
        return {data , uniqueKey , contentType: `image/${fileExtension}`}
    }catch (err : any) {
        console.log(`Error while uploading object to bucket ${bucketName}`)
        throw new Error("Error while uploading object to bucket", err)
    }
}
export {
    uploadObjectinBucket
}