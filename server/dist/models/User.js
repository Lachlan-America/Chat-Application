import mongoose, { Schema } from 'mongoose';
// User schema to define the structure of the User document in MongoDB
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);
export default User;
