import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: {
        type: String,
        required: function () {
            return this.role === 'student'; // Required only for students
        }
    },
    prnNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^\d{4}033700\d{6}$/.test(v);
            },
            message: props => `${props.value} is not a valid PRN number!`
        }
    },
    semester: {
        type: String,
        required: function () {
            return this.role === 'student'; // Required only for students
        }
    },
    branch: {
        type: String,
        required: function () {
            return this.role === 'student'; // Required only for students
        }
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' }, // To differentiate users
    dte: {
        type: String,
        required: function () {
            return this.role === 'admin'; // Required only for admins
        },
        sparse: true,
        unique: true, // Ensure DTE is unique for admins
    },
    committee: {
        type: String,
        required: function () {
            return this.role === 'admin'; // Required only for admins
        }
    },
    otp: { type: String, default: null }, // OTP for verification
    otpExpiry: { type: Number, default: null }, // Timestamp for OTP expiry (in milliseconds)
    isVerified: { type: Boolean, default: false }, // Tracks if the user is verified
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Add a unique index for prnNumber but only for students
userSchema.index(
    { prnNumber: 1, role: 1 },
    {
        unique: true,
        sparse: true,
        partialFilterExpression: { role: 'student' } // Only apply uniqueness for students
    }
);

// Add a unique index for dte but only for admins
userSchema.index(
    { dte: 1, role: 1 },
    {
        unique: true,
        sparse: true,
        partialFilterExpression: { role: 'admin' } // Only apply uniqueness for admins
    }
);

const User = mongoose.model('User', userSchema);
export default User;