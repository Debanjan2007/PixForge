import mongoose from "mongoose";
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
    __v: number,
    genToken(): Promise<string>;
}
export interface JwtPayload { 
    uid : string ,
    username : string
}
