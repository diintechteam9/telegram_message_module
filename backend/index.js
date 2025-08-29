const express=require('express');
require('dotenv').config();

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const PORT=4000;

app.get('/',(req,res)=>{
    res.send("Hello World");
});

const telegramRoutes=require('./router/telegramroute');

// Routes
app.use("/api/telegram", telegramRoutes);


app.listen(PORT,()=>{
    console.log(`server is running on PORT: ${PORT}`)
});