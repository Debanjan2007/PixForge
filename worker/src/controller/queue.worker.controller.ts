import { imagekitClient } from '../index.js'
import { s3client } from '../index.js'
import { GetObjectCommand , DeleteObjectCommand  } from '@aws-sdk/client-s3'
import {  toFile } from "@imagekit/nodejs";
import { queue } from '../db/queue.connect.js'

// upload an image to imagekit
const uploadImage = async (file : any) => {
    const image = await s3client.send(
        new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME as string,
            Key: file.fileId
        })
    )
    const unit8Array : unknown = await image?.Body?.transformToByteArray()
    const buffer = Buffer.from(unit8Array as ArrayBuffer)
    const imagekitUrl = await imagekitClient.files.upload({
        file: await toFile(buffer),
        fileName: file.fileId.slice(0, file.fileId.lastIndexOf('.')),
        useUniqueFileName: true,
    })
    const jobContent = {
        fileId: file.fileId,
        userId: file.userId,
        imagekit: imagekitUrl
    }
    await queue.add("processed" , jobContent)
    return imagekitUrl
}

const delimageHandle = async (filedId: string , imageId: string) => {
    try {
        console.log("deleting image from imagekit" , filedId , imageId)
        //  @ts-expect-error
        await imagekitClient.files.delete(filedId as string , (err : any , res : any) => {
            if(err){
                console.log(err);
                return false

            }
            console.log(res)
        })
        await s3client.send(
            new DeleteObjectCommand({
                Bucket: process.env.BUCKET_NAME as string,
                Key: imageId
            })
        )
        return true
    } catch (error) {
        console.log(error);
        throw new Error("Something went wrong", { cause: error })
    }
}
//
// const deleAllFiles = async (images: Array<any>) => {
//     const imageIds : Array<string | null> = [];
//     images.map((item) => {
//         imageIds.push(item.fieldId as string)
//     })
//     console.log(imageIds);
//     if (!imagekitClient || imagekitClient === null) {
//         console.log("Imagekit client not found")
//         throw new Error("Imagekitclient not found")
//     }
//     try {
//         await imagekitClient.bulkDeleteFiles(imageIds as string[])
//         return true
//     } catch (error) {
//         console.log(error);
//         throw new Error("something went wrong" , {cause : error})
//     }
// }
//
export {
    delimageHandle ,
    // deleAllFiles ,
    uploadImage
}