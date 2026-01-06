import mongoose from "mongoose";
import { v4 as uuid } from 'uuid'
import { hash } from 'bcrypt'
import jwt, { type Secret } from 'jsonwebtoken'
import type { imagemetadata } from '../types/image.types.js'

interface UserDocument extends mongoose.Document {
    username: string;
    password: string;
    uid: string;
    isLogedin : boolean;
    image?: Array<{
        url: string,
        fieldId: string,
        metadata: imagemetadata
    }>;
    transformedImages?: Array<{
        url: string,
        fieldId: string,
    }>
    genToken(): Promise<string>;
}

const userSchema = new mongoose.Schema<UserDocument>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            unique: true,
            match: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
        },
        isLogedin : {
            type: Boolean
        },
        uid: {
            type: String,
            unique: true,
            default: uuid(),
            immutable: true
        },
        image: [{
            url: {
                type: String
            },
            fieldId: { // this fieldid got from imagekit response object
                type: String,
            },
            metadata: {
                name: {
                    type: String
                },
                versionInfo: {
                    id: {
                        type: String
                    },
                    name: {
                        type: String
                    }
                },
                filepath: {
                    type: String
                },
                fileType: {
                    type: String,
                    default: 'image/png'
                },
                dimensions: {
                    width: {
                        type: Number
                    },
                    height: {
                        type: Number
                    }
                },
                thumbnailUrl: {
                    type: String
                }
            }
        }],
        transformedImages: [{
            url: {
                type: String
            },
            fieldId: {
                type: String,
                default: uuid()
            }
        }]
    },
    {
        timestamps: true
    }
)

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await hash(this.password, 8)
    }
    return next;
})
userSchema.methods.genToken = async function () {
    const payload = {
        uid: this.uid,
        username: this.username
    }
    return jwt.sign(
        payload,
        process.env.JWT_AUTH as string as Secret,
        { expiresIn: "1d" },
    )
}

export const User = mongoose.model("User", userSchema)