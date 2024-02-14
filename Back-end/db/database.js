const mongoose = require('mongoose')
async function mongooseconnection(){
    await mongoose.connect(process.env.MONGODBURL)
}
module.exports = mongooseconnection;