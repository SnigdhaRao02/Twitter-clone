import express from "express";

const app=express();

app.get('/', (req,res)=>{
    res.send('server ready');
});


app.listen(8000, ()=>{
    console.log('server up and running at port 8000');
});