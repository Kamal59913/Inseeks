const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    name: String,
    email: String,
    suggestion: String,
    message: String
})

module.exports = mongoose.model("Chat", chatSchema)