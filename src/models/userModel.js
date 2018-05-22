import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const baseOptions = {
    timestamps: true
};

const userSchema = new mongoose.Schema({
    nif: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    language: {
        type: String,
        enum: ['en', 'es', 'cat'],
        default: 'en'
    }
}, baseOptions);

userSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

// Compare Password async with a callback(error, isMatch)
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
};

export const userModel = mongoose.model('User', userSchema);