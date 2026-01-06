import { imagekitClient } from '../src/utils/imagekit.conf.js'
const delimageHandle = async(fieldId : string ) => {
    try {
        console.log("came to here");        
        const res = await imagekitClient?.files.delete(`${fieldId}`)
        console.log("Image url is deleted " , res); 
    } catch (error) {
        console.log(error);        
    }       
}



export {
    delimageHandle
}