import dotenv from "dotenv"
import {app} from './app.js'
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})

connectDB()

.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port : ${process.env.PORT}` )
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!",err)
})



















// import mongoose from "mongooe";
// import { DB_NAME } from "./constants";
// import express from "express";
// const app = express()

// ;( async ()=>{

//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         application.on("error",()=>{
//             console.log("Error: ", error)
//             throw error
//         });

// app.listen(process.env.PORT,()=>{
//     console.log(`APP is listen on PORT ${process.env.PORT}`);
// })
//     } catch (error) {
//         console.log("ERROR: ",error)
//         throw error
//     }

// })()