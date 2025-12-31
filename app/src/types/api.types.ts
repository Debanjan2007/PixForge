import mongoose from "mongoose";
import type { imagemetadata } from "../types/image.types.js";
export interface user {
    username: string,
    password: string
}
export interface dbuser {
    save(arg0: { validateBeforeSave: boolean; }): unknown;
    uid: string,
    username: string,
    password: string,
    isLogedin : boolean,
    _id: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
    image?: Array<{
        url: string,
        fieldId: string,
        metadata: imagemetadata
    }>,
    transformedImages?:  Array<{
        url: string,
        fieldId?: string,
    }>
    __v: number,
    genToken(): Promise<string>;
}
export interface JwtPayload { 
    uid : string ,
    username : string
}
