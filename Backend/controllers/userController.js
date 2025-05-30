import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import cloudinary from 'cloudinary';

const loginUser = async (req,res) => {
    const {email,password} = req.body;
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false,message:"user doesn't exist"});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success : false,message:"Invalid credentials"});
        }

        const token = createToken(user);
        return res.json({success:true,token});
        
    } catch (error) {
        return res.json({success:false,message:"Error on login page"});        
    }
}

const createToken = (user) => {
    return jwt.sign({
        _id: user._id,
        channelName: user.channelName,
        logoId: user.logoId,
        email: user.email,
        phone: user.phone,
    },process.env.JWT_SECRET,{
        expiresIn: '365d'
    });
}

const registerUser = async (req,res) => {
    const {channelName,password,email} = req.body;
    try{
        //checking is user already exists
        const exists = await userModel.findOne({email});
        if(exists){
            return res.json({success : false,message:"User already exists"});
        }
        //validating email format & strong password

        if(!validator.isEmail(email)){
            return res.json({success : false,message:"Please enter a valid email"});
        }

        if(password.length < 8){
            return res.json({success : false,message:"Please enter a strong password"});
        }
        
        //hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const uploadedImage = await cloudinary.v2.uploader.upload(req.files.logo.tempFilePath);

        const newUser = new userModel({
            channelName:channelName,
            phone: req.body.phone,
            logoUrl: uploadedImage.secure_url,
            logoId: uploadedImage.public_id,
            email:email,
            password : hashedPassword
        });

        const user = await newUser.save();
        const token = createToken(user);
        res.status(200).json({success:true,token});

    }catch(err){
        console.log(err);
        res.json({success:false,message:err});
    }
}

const subscribeChannel = async (req, res) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        if(!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(verified._id);

        const channelId = req.params.channelId;
        const channel = await userModel.findById(channelId);

        if(channel.subscribedBy.includes(user._id)) {
            return res.status(400).json({ success: false, message: "Already subscribed to this channel" });
        }

        channel.subscribers += 1;
        channel.subscribedBy.push(user._id);
        await channel.save();
        user.subscribedChannels.push(channelId);
        await user.save();

        return res.status(200).json({ success: true, message: "Subscribed to channel successfully" });
        
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error subscribing user" });
    }

}

const unsubscribeChannel = async (req, res) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        if(!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(verified._id);

        const channelId = req.params.channelId;
        const channel = await userModel.findById(channelId);

        if(!channel.subscribedBy.includes(user._id)) {
            return res.status(400).json({ success: false, message: "Not subscribed to this channel" });
        }

        channel.subscribers -= 1;
        channel.subscribedBy.pull(user._id);
        await channel.save();
        user.subscribedChannels.pull(channelId);
        await user.save();

        return res.status(200).json({ success: true, message: "Unsubscribed from channel successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error unsubscribing user" });
    }
}

export {loginUser,registerUser,subscribeChannel ,unsubscribeChannel};