import mongoose from 'mongoose';

const connectDB = async ()=>{
    try{
        const mongoURI = process.env.MONGO_URI;
        if(!mongoURI){
            console.error("MONGO_URI is not defined in environment variables");
            throw new Error("MONGO_URI is not defined");
        }
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

export default connectDB;