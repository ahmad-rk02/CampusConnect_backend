import mongoose from 'mongoose';

const { model, models, Schema } = mongoose;

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    prnNumber: {
        type: String,
        unique: true,
    },
    semester: {
        type: String,
    },
    branch: {
        type: String,
    },
    // New fields for admin
    dte: {
        type: String,
        unique: true,
    },
    committee: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    }
}, {
    timestamps: true,
});

const User = models?.User || model('User', userSchema);
export default User;
