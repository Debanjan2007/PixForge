import { imagekitClient } from '../index.js'
const delimageHandle = async(fieldId : string )=> {
    try {
        if(!imagekitClient || imagekitClient === null){
            throw new Error("Imagekitclient not found")
        }
        const delimages = await imagekitClient.deleteFile(fieldId)
        console.log(delimages);        
        return true
    } catch (error) {
        console.log(error);
        return error      
    }       
}



export {
    delimageHandle
}