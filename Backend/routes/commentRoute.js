import express from 'express';
import {addComment, getComments, updateComment, deleteComment} from '../controllers/commentController.js';
import { checkAuth } from '../middleware/checkAuth.js';

const commentRouter = express.Router();

commentRouter.post('/new-comment/:videoId',checkAuth,addComment);
commentRouter.get('/:videoId', getComments);
commentRouter.put('/:commentId', checkAuth, updateComment);
commentRouter.delete('/:commentId', checkAuth, deleteComment);

export default commentRouter;