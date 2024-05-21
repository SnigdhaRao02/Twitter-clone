import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) =>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{  //added userId as payload
        expiresIn:'15d'
    })

    res.cookie("jwt", token, {
        maxAge : 15*24*60*60*1000, //in milliseconds
        httpOnly:true, //prevent XSS attacks
        sameSite: "strict", //CSRF attacks prevented
        secure: process.env.NODE_ENV !== "development",
    })

}