import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import 'dotenv/config'
import userRouter from "./routes/userRoute.js";
import videoRouter from "./routes/videoRoute.js";
import commentRouter from "./routes/commentRoute.js";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";

// app config
const app = express();
const port = 5000;

//middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads'
}));

// db connection
connectDB();

// api endpoints

app.use('/user',userRouter);
app.use('/video',videoRouter);
app.use('/comment',commentRouter);



app.get('/',(req,res)=>{
    res.send("API Working");
});

app.listen(port,()=>console.log(`Server Started on http://localhost:${port}`));
