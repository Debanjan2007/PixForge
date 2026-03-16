import {HeadBucketCommand} from "@aws-sdk/client-s3";
import {s3client} from "../../index.js";

export const bucketExists = async (bucketname: string) => {
    try {
        await s3client.send(new HeadBucketCommand({Bucket: bucketname}))
        return true
    }catch (err){
        console.log(`${bucketname} bucket does not exist`);
        return false
    }
}
