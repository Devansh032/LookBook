import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    videoId : {
        type:String,
        required: true,
    },
    commentText : {
        type:String,
        required: true,
    },
},{timestamps: true});

const commentModel = mongoose.model('comment', commentSchema);
export default commentModel;