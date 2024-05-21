import express from "express";
import dotenv from "dotenv";
import authRoutes from "../backend/routes/auth.routes.js";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app=express();

// app.get('/', (req,res)=>{
//     res.send('server ready');
// });


app.use(express.json()); //middle layer to parse req.body
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);


app.listen(process.env.POST || 8000, ()=>{
    console.log('server up and running at port 8000');
    connectMongoDB();
});