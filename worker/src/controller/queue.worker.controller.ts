import { imagekitClient } from '../index.js'
import { s3client } from '../index.js'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import {  toFile } from "@imagekit/nodejs";

// upload an image to imagekit
const uploadImage = async (fileId : string) => {
    const image = await s3client.send(
        new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME as string,
            Key: fileId
        })
    )
    const unit8Array : unknown = await image?.Body?.transformToByteArray()
    // console.log(unit8Array)
    const buffer = Buffer.from(unit8Array as ArrayBuffer)
    // console.log(`The image buffer is ${buffer}`)
    const imagekitUrl = await imagekitClient.files.upload({
        file: await toFile(buffer),
        fileName: fileId.slice(0, fileId.lastIndexOf('.')),
        useUniqueFileName: true,
    })
    console.log(`The imagekit url is`,imagekitUrl)
    return imagekitUrl
}

// const delimageHandle = async (filedId: string) => {
//     if (!imagekitClient || imagekitClient === null) {
//         console.log("Imagekit client not found")
//         throw new Error("Imagekitclient not found")
//     }
//     try {
//         await imagekitClient.deleteFile(filedId as string)
//         return true
//     } catch (error) {
//         console.log(error);
//         throw new Error("Something went wrong", { cause: error })
//     }
// }
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
    // delimageHandle ,
    // deleAllFiles ,
    uploadImage
}