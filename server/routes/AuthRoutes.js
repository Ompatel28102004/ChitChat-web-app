import {Router} from "express";
import {signup,login, updateProfile, logout} from "../controllers/AuthController.js";
import {getUserInfo} from "../controllers/AuthController.js";
import verifyToken  from "../middlewares/AuthMiddleware.js";
const authRoutes= Router();
authRoutes.post("/signup",signup);
authRoutes.post("/login",login);
authRoutes.get('/user-info',verifyToken,getUserInfo);
authRoutes.post('/update-profile',verifyToken,updateProfile);
authRoutes.post('/logout',logout);
// authRoutes.post('add-profile-image',verifyToken,addProfileImage); 
export default authRoutes;