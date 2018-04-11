const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        type: String,
        required: true
    }
}, baseOptions);

userSchema.pre('save', function(next) {
    if (!this.isModified('password')) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

// Compare Password async with a callback(error, isMatch)
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
};

export const userModel = mongoose.model('User', userSchema);

export const beneficiaryModel = userModel.discriminator('Beneficiary', new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    }
}));

export const entityModel = userModel.discriminator('Entity', new mongoose.Schema({
    salesmanFirstName: {
        type: String,
        required: true
    },
    salesmanLastName: {
        type: String,
        required: true
    },
    validationCode: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    addressLatitude: {
        type: Number,
        required: true
    },
    addressLongitude: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: false
    }
}));