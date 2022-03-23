import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './userRoutes/user.js'
import fileUpload from 'express-fileupload'
import { createServer } from "http";
import { Server } from "socket.io";



dotenv.config();
const app=express();
const httpServer = createServer(app);




//online users
let onlineusers=[];

function addusers(userid,socketid){
  !onlineusers.some(user=>user.userid===userid)&& onlineusers.push({userid,socketid})
  console.log('userss',onlineusers);
}
function removeuser(socketid)
{
  onlineusers=onlineusers.filter((user)=>user.socketid!==socketid)
  // console.log('new array remove',onlineusers)
}

function getuser(userid)
{
  return  onlineusers.filter(user=>user.userid===userid)
  // console.log('this is usr',user)

}



const io = new Server(httpServer, {
    
  
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  }

  );


  
app.use(express.json());

app.get('/api/socket',(req,res)=>
{

  io.on("connection", (socket) => {
    // console.log('connected  ',socket)
    
    socket.on('newuser',(userid)=>
    {
        addusers(userid._id,socket.id)

    })
    socket.on("disconnect",()=>
    {
      console.log(socket.id)
       removeuser(socket.id)
    })
    socket.on('sendmessage',(userid)=>
    {
      console.log('hello this is your user id',userid)
        const user=getuser(userid)
        console.log(user[0])
       if(io.emit('msgnotification','hi you got  message'+Math.random())){
         console.log(user[0].socketid)
       }
    })
    
    res.send('ok')
  });

})


//STATIC PATH FOR IMAGES
app.use(express.static("public"));
app.use("/api/uploads", express.static("uploads/webp"));


const PORT=process.env.PORT;
const DB=process.env.DB;

//CONNECTING TO DATABASE
mongoose.connect(DB,{useNewUrlParser:true,useUnifiedTopology:true}).then((res)=>console.log('connected to db')).catch((err)=>console.log(err));

app.use(fileUpload());
// ROUTERS MIDDLWARE
app.use('/',userRouter) 


httpServer.listen(PORT,()=>console.log(`server is running at http://localhost:`+PORT))