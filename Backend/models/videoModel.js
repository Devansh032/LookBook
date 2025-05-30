import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: {  
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    videoId: {
        type: String,
        required: true,
    },
    thumbnailUrl: {
        type: String,
        required: true,
    },
    thumbnailId: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    tags : [{
        type: String,
        required: true,
    }],
    views: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
    },
    viewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    dislikedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],


},{timestamps: true});

const videoModel = mongoose.model('video', videoSchema);
export default videoModel;

