import type { processedImageJob } from "../types/api.types.js";
import {Images} from "../model/images.model.js";

const updateImageProcessedUrl = async (job: processedImageJob) => {
    try {
        await Images.findByIdAndUpdate(
            job.userId,
            {
                status: "uploaded",
                processedUrl: `${job.imagekit.url}?tr=f-webp`,
                fileId: job.imagekit.fileId,
                metadata: {
                    name: job.imagekit.name,
                    versionInfo: {
                        id: job.imagekit.fileId,
                        name: job.imagekit.name
                    },
                    filepath: job.imagekit.filePath,
                    fileType: `${job.imagekit.fileType}/webp`,
                    dimensions: {
                        width: job.imagekit.width,
                        height: job.imagekit.height
                    },
                    thumbnailUrl: job.imagekit.thumbnailUrl
                }
            },
            {
                returnDocument: 'after'
            }
        )
    }catch (err){
        console.log("Error while updating image processed url",err)
        return err
    }
};

export {
    updateImageProcessedUrl
}