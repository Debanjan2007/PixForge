import type { processedImageJob } from "../types/api.types.js";
import mongoose from "mongoose";
import {Images} from "../model/images.model.js";

const updateImageProcessedUrl = async (job: processedImageJob) => {
    const imageData = await Images.findByIdAndUpdate(
        job.userId ,
        {
            processedUrl: job.imagekit.url ,
            fileId: job.imagekit.fileId ,
            metadata: {
                name: job.imagekit.name ,
                versionInfo: {
                    id: job.imagekit.fileId,
                    name:job.imagekit.name
                },
                filepath: job.imagekit.filePath,
                fileType: job.imagekit.fileType,
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
};

export {
    updateImageProcessedUrl
}