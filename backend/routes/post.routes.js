import express from "express";
const router = express.Router();
import {protectRoute} from "../middleware/protectRoute.js";  //only for authenticated user
import {createPost, 
    deletePost, 
    commentOnPost, 
    likeUnlikePost, 
    getAllPosts, 
    getLikedPosts, 
    getFollowingPosts,
    getUserPosts} from "../controllers/post.controller.js";


router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts); //get posts of users you follow
router.get("/user/:username", protectRoute, getUserPosts); //get posts of this user
router.get("/likes/:id", protectRoute, getLikedPosts); //get all posts liked by you

router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

export default router;