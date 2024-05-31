import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";

import authRoutes from "../backend/routes/auth.routes.js";
import userRoutes from "../backend/routes/user.routes.js";
import postRoutes from "../backend/routes/post.routes.js";


dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app=express();

// app.get('/', (req,res)=>{
//     res.send('server ready');
// });


app.use(express.json()); //middle layer to parse req.body
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/api/auth", authRoutes); //auth routes and controllers
app.use("/api/users", userRoutes); //user routes and controllers
app.use("/api/posts", postRoutes); //post routes and controllers


app.listen(process.env.POST || 8000, ()=>{
    console.log('server up and running at port 8000');
    connectMongoDB();
});