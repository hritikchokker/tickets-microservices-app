import mongoose from "mongoose";
import { Password } from "../services/password";

interface IUser {
    email: string,
    password: string
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: IUser): UserDoc
}

interface UserDoc extends mongoose.Document {
    email: string,
    password: string
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.__v;
            ret.id = ret._id;
            delete ret._id;
        },
    }
});

userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

userSchema.statics.build = (attr: IUser) => {
    return new User(attr);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);



export { User };