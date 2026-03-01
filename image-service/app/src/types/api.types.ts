import mongoose from "mongoose";
interface dbuser {
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
export type { dbuser };