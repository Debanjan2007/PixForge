import mongoose from "mongoose";
import { v4 as uuid } from 'uuid'
import { hash } from 'bcrypt'
import jwt, { type Secret } from 'jsonwebtoken'

interface UserDocument extends mongoose.Document {
    username: string;
    password: string;
    uid: string;
    isLogedin : boolean;
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
        }
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