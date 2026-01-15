import { imagekitClient } from '../index.js'
const delimageHandle = async (filedId: string) => {
    if (!imagekitClient || imagekitClient === null) {
        console.log("Imagekit client not found")
        throw new Error("Imagekitclient not found")
    }
    try {
        await imagekitClient.deleteFile(filedId as string)
        return true
    } catch (error) {
        console.log(error);
        throw new Error("Something went wrong", { cause: error })
    }
}

const deleAllFiles = async (images: Array<any>) => {
    const imageIds : Array<string | null> = [];
    images.map((item) => {
        imageIds.push(item.fieldId as string)
    })
    console.log(imageIds);
    if (!imagekitClient || imagekitClient === null) {
        console.log("Imagekit client not found")
        throw new Error("Imagekitclient not found")
    }
    try {
        await imagekitClient.bulkDeleteFiles(imageIds as string[])
        return true
    } catch (error) {
        console.log(error);        
        throw new Error("something went wrong" , {cause : error})
    }
}

export {
    delimageHandle ,
    deleAllFiles
}