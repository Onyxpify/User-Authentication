const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name field must be filled"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "password is required"],
    },
})

const User = mongoose.model('User', userSchema)

module.exports = User