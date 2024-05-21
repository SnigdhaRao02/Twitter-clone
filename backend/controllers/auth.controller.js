import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {generateTokenAndSetCookie} from "../lib/utils/generateToken.js";

export const signup = async(req,res)=>{
    // res.json({
    //     data: "you hit the signup endpoint"
    // });

    try{
        const {fullName, username, email, password} = req.body;

        //check if valid email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)){
            return res.status(400).json({error: "Invalid email format"});
        }

        //check if username already exists in DB
        const existingUser = await User.findOne({username});

        if(existingUser){
            return res.status(400).json({error: "Username already taken"});
        }

        //check for exisiting email
        const existingEmail = await User.findOne({email});

        if(existingEmail){
            return res.status(400).json({error: "Email already taken"});
        }

        if(password.length <6){
            return res.status(400).json({error: "Password should be atleast 6 characters long"});
        }

        //hash password
        const salt = await bcrypt.genSalt(10); //higher the number, more time this step takes
        const hashedPassword = await bcrypt.hash(password, salt);

        //create new user to put into DB
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword
        })

        if(newUser){
            generateTokenAndSetCookie(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            })
        }else{
            res.status(400).json({error: "Invalid user data"});
        }



    }catch(error){
        console.log("Error in signup controller");
        res.status(500).json({error: "Internal server error"});

    }
};


export const login = async (req,res)=>{
    // res.json({
    //     data: "you hit the login endpoint"
    // });

    try{
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if(!user || !isPasswordCorrect){
            return res.status(400).json({error: "Invalid username or password"});
        }

        generateTokenAndSetCookie(user._id,res);
            

        res.status(200).json({
            _id:user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg
        })

    }catch(error){
        console.log("Error in login controller");
        res.status(500).json({error: "Internal server error"});
    }
};


export const logout = async (req,res)=>{
    // res.json({
    //     data: "you hit the logout endpoint"
    // });
    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged out successfully"});

    }catch(error){
        console.log("Error in logout controller");
        res.status(500).json({error: "Internal server error"});

    }
};

//to get authenticated user
export const getMe = async (req,res) =>{
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    }catch(error){
        console.log("Error in getMe controller", error.message);
        res.status(500).json({error: "Internal server error"});

    }
}