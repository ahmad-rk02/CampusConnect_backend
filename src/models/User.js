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
        required: function () {
            return this.role === 'student'; // Required only for students
        },
        sparse: true,
        default: undefined // Prevents storing null values
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
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    dte: {
        type: String,
        required: function () {
            return this.role === 'admin'; // Required only for admins
        },
        sparse: true,
        default: undefined // Prevents storing null values
    },
    committee: {
        type: String,
        required: function () {
            return this.role === 'admin'; // Required only for admins
        }
    },
    otp: { type: String, default: null },
    otpExpiry: { type: Number, default: null },
    isVerified: { type: Boolean, default: false },
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

// Unique index for prnNumber (students only)
userSchema.index(
    { prnNumber: 1 },
    {
        unique: true,
        partialFilterExpression: { 
            role: 'student',
            prnNumber: { $exists: true, $type: 'string' }
        }
    }
);

// Unique index for dte (admins only)
userSchema.index(
    { dte: 1 },
    {
        unique: true,
        partialFilterExpression: { 
            role: 'admin',
            dte: { $exists: true, $type: 'string' }
        }
    }
);

// Ensure email is always unique
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
export default User;