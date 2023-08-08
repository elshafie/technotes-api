const mongoose= require('mongoose');

const connectDB = async() => {
    const DBUrl = process.env.DATABASE_URI
    try{
        await mongoose.connect(DBUrl)
    }catch (err) {
        console.log(err);
    }
}

module.exports = connectDB;