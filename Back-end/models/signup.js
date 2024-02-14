const mongoose = require('mongoose')

const signUpSchema = new mongoose.Schema({
    fullname : String,
    email: String,
    pass: String,
    username: String,
    imageName: String,
    imageUrl: String
},
{timestamps: true}
)

module.exports = mongoose.model("SignUp",signUpSchema)