import mongoose from "mongoose";
interface dbuser {
    save(arg0: { validateBeforeSave: boolean; }): unknown;
    uid: string,
    id: string,
    username: string,
    password: string,
    isLogedin : boolean,
    _id: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
    __v: number,
    genToken(): Promise<string>;
}
interface processedImageJob {
    fileId: string ,
    imagekit: any,
}
export type {
    dbuser ,
    processedImageJob
};
export interface fileTypeResult {

}