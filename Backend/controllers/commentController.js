import commentModel from '../models/commentModel.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const addComment = async (req, res) => {
    
    try {
        
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);

        const newComment = new commentModel({
            videoId : req.params.videoId,
            userId: verifiedUser._id,
            commentText : req.body.commentText,
        });

        const savedComment = await newComment.save();
        return res.status(200).json({ success: true, message: "Comment added successfully", comment: savedComment });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error adding comment", error: error.message });
    }
}

const getComments = async (req, res) => {
    try {
        const comments = await commentModel.find({ videoId: req.params.videoId }).populate('userId', 'channelName logoUrl');
        return res.status(200).json({ success: true, comments });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching comments", error: error.message });
    }
}

const updateComment = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        
        const comment = await commentModel.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }
        
        if (comment.userId.toString() !== verifiedUser._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only update your own comments" });
        }

        comment.commentText = req.body.commentText;
        const updatedComment = await comment.save();
        
        return res.status(200).json({ success: true, message: "Comment updated successfully", comment: updatedComment });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error updating comment", error: error.message });
    }
}

const deleteComment = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        
        const comment = await commentModel.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }
        
        if (comment.userId.toString() !== verifiedUser._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only delete your own comments" });
        }

        await commentModel.findByIdAndDelete(req.params.commentId);
        
        return res.status(200).json({ success: true, message: "Comment deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error deleting comment", error: error.message });
    }
}

export {addComment, getComments,updateComment,deleteComment};