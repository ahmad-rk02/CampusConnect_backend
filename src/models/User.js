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
        unique: true,
        // No unique constraint here, handled by the index
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
        }
    }, // DTE for admin
    committee: {
        type: String,
        required: function () {
            return this.role === 'admin'; // Required only for admins
        }
    } ,// Committee for admin
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

// Add a unique index for prnNumber but only for students
userSchema.index({ prnNumber: 1, role: 1 }, { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { role: 'student' } // Only apply uniqueness for students
});


const User = mongoose.model('User', userSchema);
export default User;
