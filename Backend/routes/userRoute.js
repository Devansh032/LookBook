import express from 'express';
import { registerUser, loginUser,subscribeChannel,unsubscribeChannel } from '../controllers/userController.js';
import { connectCloudinary } from '../config/cloudinary.js';
import { checkAuth } from '../middleware/checkAuth.js';

connectCloudinary();

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.put('/subscribe/:channelId', checkAuth, subscribeChannel);
userRouter.put('/unsubscribe/:channelId', checkAuth, unsubscribeChannel);



export default userRouter;