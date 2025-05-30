import videoModel from "../models/videoModel.js";
import userModel from "../models/userModel.js";
import cloudinary from "cloudinary"
import jwt from 'jsonwebtoken';
import 'dotenv/config';


const uploadVideo = async (req, res) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        const uploadedVideo = await cloudinary.v2.uploader.upload(req.files.video.tempFilePath, {
            resource_type: "video", 
        });
        const uploadedThumbnail = await cloudinary.v2.uploader.upload(req.files.thumbnail.tempFilePath);
        const newVideo = new videoModel({
            title: req.body.title,
            description: req.body.description,
            userId : user._id,
            category: req.body.category,
            tags: req.body.tags.split(','),
            videoUrl: uploadedVideo.secure_url,
            videoId: uploadedVideo.public_id,
            thumbnailUrl: uploadedThumbnail.secure_url,
            thumbnailId: uploadedThumbnail.public_id,
        });

        const newUploadedVideo = await newVideo.save();
        return res.status(200).json({ success: true, message: "Video uploaded successfully", video: newUploadedVideo });

    }
    catch (error) {
        console.error("Error uploading video:", error);
        return res.status(500).json({ success: false, message: "Error uploading video" });
    }

}

const updateVideo = async (req, res) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(verifiedUser._id);
        
        const video = await videoModel.findById(req.params.videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }
        
        if (video.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this video" });
        }

        

        if (req.files) {
            await cloudinary.v2.uploader.destroy(video.thumbnailId,);
            const updatedThumbnail = await cloudinary.v2.uploader.upload(req.files.thumbnail.tempFilePath);

            const updatedData = {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                tags: req.body.tags.split(','),
                thumbnailUrl: updatedThumbnail.secure_url,
                thumbnailId: updatedThumbnail.public_id,
            };
            const updatedVideo = await videoModel.findByIdAndUpdate(req.params.videoId, updatedData, { new: true });
            return res.status(200).json({ success: true, message: "Video updated successfully", video: updatedVideo });
        }
        else{
            const updatedData = {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                tags: req.body.tags.split(','),
            };
            const updatedVideo = await videoModel.findByIdAndUpdate(req.params.videoId, updatedData, { new: true });
            return res.status(200).json({ success: true, message: "Video updated successfully", video: updatedVideo });
        }
        
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error updating video" });
    }
}

const deleteVideo = async (req, res) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(verifiedUser._id);
        
        const video = await videoModel.findById(req.params.videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }
        
        if (video.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this video" });
        }

        await cloudinary.v2.uploader.destroy(video.videoId, { resource_type: "video" });
        await cloudinary.v2.uploader.destroy(video.thumbnailId);
        
        await videoModel.findByIdAndDelete(req.params.videoId);
        
        return res.status(200).json({ success: true, message: "Video deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting video:", error);
        return res.status(500).json({ success: false, message: "Error deleting video" });
    }
}
   
const likeVideo = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(verifiedUser._id);
        
        const video = await videoModel.findById(req.params.videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        if (video.likedBy.includes(user._id)) {
            return res.status(400).json({ success: false, message: "You have already liked this video" });
        }

        if(video.dislikedBy.includes(user._id)) {
            video.dislikes -= 1;
            video.dislikedBy = video.dislikedBy.filter(id => id.toString() !== user._id.toString());
        }

        video.likes += 1;
        video.likedBy.push(user._id);
        await video.save();
        
        return res.status(200).json({ success: true, message: "Video liked successfully"});
    } catch (error) {
        console.error("Error liking video:", error);
        return res.status(500).json({ success: false, message: "Error liking video" });
    }
}

const dislikeVideo = async (req, res) => {

    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(verifiedUser._id);
        
        const video = await videoModel.findById(req.params.videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        if (video.dislikedBy.includes(user._id)) {
            return res.status(400).json({ success: false, message: "You have already disliked this video" });
        }

        if(video.likedBy.includes(user._id)) {
            video.likes -= 1;
            video.likedBy = video.likedBy.filter(id => id.toString() !== user._id.toString());
        }

        video.dislikes += 1;
        video.dislikedBy.push(user._id);
        await video.save();
        
        return res.status(200).json({ success: true, message: "Video disliked successfully"});
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error disliking video" });
    }
}

const viewVideo = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(verifiedUser._id);
        const video = await videoModel.findById(req.params.videoId);

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }
        video.views += 1;
        video.viewedBy.push(user._id);
        await video.save();
        return res.status(200).json({ success: true, video });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching video" });
    }
}

export { uploadVideo ,updateVideo,deleteVideo,likeVideo,dislikeVideo,viewVideo };