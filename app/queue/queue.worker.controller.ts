import { imagekitClient } from '../index.js'
const delimageHandle = async (filedId: string) => {
    if (!imagekitClient || imagekitClient === null) {
        console.log("Imagekit clent not found")
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



export {
    delimageHandle
}