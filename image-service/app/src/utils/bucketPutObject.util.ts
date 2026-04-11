import {PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {s3client} from "../../index.js";
import {v4 as uuidV4} from 'uuid'
// Put or upload an object to a bucket.
const uploadObjectinBucket = async (bucketName: string, userid: string , filetype: string) => {
    try {
        const uniqueKey: string = `${userid}_${uuidV4()}`
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: uniqueKey,
            ContentDisposition: "inline",
            ContentType: filetype,
        })
        const presignedUrl = await getSignedUrl(s3client, command, {expiresIn: 600}) // 10 minutes
        return {presignedUrl, uniqueKey}
    } catch (err: any) {
        console.log(`Error while uploading object to bucket ${bucketName}`)
        throw new Error("Error while uploading object to bucket", err)
    }
}
export {
    uploadObjectinBucket
}