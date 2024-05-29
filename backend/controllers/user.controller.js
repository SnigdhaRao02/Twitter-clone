import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

// user profile = name, #followers, #following, etc.
export const getUserProfile = async(req,res) =>{
    const {username} = req.params;

    try{
        const user = await User.findOne({username}).select("-password"); //deselect the password field
        if(!user){
            return res.status(404).json({error:"User not found"});
        }

        res.status(200).json(user);
    }catch(error){
        console.log("error in getUserProfile:", error.message);
        res.status(500).json({error: error.message});
    }

};

export const followUnfollowUser = async (req,res) =>{
    try{

        const {id} = req.params;
        
        //for the user you will follow/unfollow
        const userToModify = await User.findById(id);

        //your current user id
        const currentUser = await User.findById(req.user._id); //user field is mentioned in protectRoute

        //to make sure user can't follow/unfollow themselves
        if(id == req.user._id){
            return res.status(400).json({error:"You can't follow/unfollow yourself"});
        }

        //checks to make sure the userToModify or currentUser is found or not
        if(!userToModify || !currentUser) return res.status(400).json({error:"User not found"});

        //check if already following the user
        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            //unfollow
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}});
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}});
            
            //TODO: return id of the user as response
            res.status(200).json({message: "User unfollowed successfully"});

        }else{
            //follow the user
            await User.findByIdAndUpdate(req.user._id, {$push:{following: id}}); //current user is following id
            await User.findByIdAndUpdate(id, {$push:{followers: req.user._id}}); //user with id has current user as follower.


            //send notification to the user --later

            const newNotification = new Notification({
                type:"follow",
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save();

            //TODO: return id of the user as response
            res.status(200).json({message: "User followed successfully"});
        }


        
    }catch(error){
        console.log("error in followUnfollowUser:", error.message);
        res.status(500).json({error: error.message});
    }

}

export const getSuggestedUsers = async (req,res) => {
    try{

        const myUserId = req.user._id;
        const usersFollowedByMe = await User.findById(myUserId).select("following");

        //get top 10 users that are not me
        const users = await User.aggregate([
            {
                $match:{
                    _id:{$ne: myUserId},  //ne= not equalt to mine
                },
            },
            {
                $sample:{size:10}
            },
        ]);

        //filter out users I already follow
        const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));

        //get me my top 4 suggested users
        const suggestedUsers = filteredUsers.slice(0,4);

        suggestedUsers.forEach((user) => {user.password = null});

        res.status(200).json(suggestedUsers); //return suggested users

    }catch(error){
        console.log("error in getSuggestedUsers:", error.message);
        res.status(500).json({error: error.message});
    }
}

export const updateUser = async (req,res) => {
    const {username, fullName, email, currentPassword, newPassword, bio, link} = req.body;
    let {profileImg, coverImg} = req.body;

    const userId = req.user._id;
    try{
        let user = await User.findById(userId);
        //no user found
        if(!user) return res.status(400).json({message:"User not found"});

        //empty password fields
        if ((!newPassword && currentPassword) || (newPassword && !currentPassword)){
            return res.status(400).json({error: "Provide both current and new password"});

        }

        
        if(currentPassword && newPassword){
            //correct password entered
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch) return res.status(400).json({error: "Current password is incorrect"});
            if(newPassword.length < 6) return res.status(400).json({error: "Password should be atleast 6 characters"});

            //hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        //updating profile and cover images
        if(profileImg){
            //delete old image from cloudinary
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;

        }

        if(coverImg){
            //delete old image from cloudinary
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;

        }

        //now update all
        user.fullName = fullName || user.fullName;  //if user provided updated fullname, use that. Or use exisiting
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio; 
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        user.password = null;  //can't show password in response

        return res.status(200).json(user);


    
    }catch(error){
        console.log("error in updateUser:", error.message);
        res.status(500).json({error: error.message});
    }
}