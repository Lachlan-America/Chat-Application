import mongoose, { Document, Schema, Model } from 'mongoose';

// For TypeScript, we define an interface for the User model
export interface IUser extends Document {
    username: string;
    password: string;
}

// User schema to define the structure of the User document in MongoDB
const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;