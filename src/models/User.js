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
        required: true,
    },
    prnNumber: {
        type: String,
        required: true,
        unique: true,
    },
    semester: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const User = models?.User || model('User', userSchema);

export default User;
