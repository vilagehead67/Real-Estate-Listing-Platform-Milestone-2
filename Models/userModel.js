const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: {type: String, require: true},
    middleName: {type: String, default: ""},
    lastName: {type: String, require: true},
    email: {type: String, require: true},
    username:{type: String, require: true, unique: true}, 
    password: {type: String, require: true},
    role: {type: String, enum: ["agent", "user"], default: "user"}
}, {timestamps: true})

const User = new mongoose.model("User", userSchema);

module.exports = User