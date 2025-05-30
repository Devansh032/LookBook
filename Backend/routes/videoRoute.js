import express from 'express';
import { checkAuth } from '../middleware/checkAuth.js';
import { uploadVideo,updateVideo, deleteVideo,likeVideo, dislikeVideo, viewVideo} from '../controllers/videoController.js';import { connectCloudinary } from '../config/cloudinary.js';
connectCloudinary();

const videoRouter = express.Router();
videoRouter.post('/upload', checkAuth, uploadVideo);
videoRouter.put('/:videoId',checkAuth, updateVideo);
videoRouter.delete('/:videoId', checkAuth, deleteVideo);
videoRouter.put('/like/:videoId', checkAuth, likeVideo);
videoRouter.put('/dislike/:videoId', checkAuth, dislikeVideo);
videoRouter.get('/view/:videoId', checkAuth, viewVideo);


export default videoRouter;