import pkg from "jsonwebtoken";
import { UserOrgRepository } from "../models/Models.js";
import { HARDWARE, roles } from "../utils/constants.js";

const { verify }  = pkg;

export const IsAdmin = async (req,res,next)=>{
    try {
        // harware by pass this
        
        // check for email and org_id
        const org_id = req.body.org_id || req.headers?.org_id;
        // console.log("Body for admin: ",req.body,req.headers)
        const {email, hardware} = req.user;
        if(hardware){
            console.log("This hardware by pass Admin");
            next();
        }
        if(!org_id || !email){
            return res.status(404).json({
                success:false,
                message:"Org_id or email is missing!"
            })
        }
        // fetch the userOrg Role
        const userOrgRole = await UserOrgRepository.getById({org_id,email});
        if(!userOrgRole){
            return res.status(404).json({
                success:false,
                message:"User does not exit in this org!"
            })
        }

        // isAdmin or root
        if(userOrgRole?.role===roles.ADMIN || userOrgRole?.role===roles.SUPER_ADMIN){
            next();
        }else{
              return res.status(400).json({
                success:false,
                message:"This is protected route you dont have access!",
                yourRole:userOrgRole?.role
            
            })
        }
        

    } catch (error) {
        console.error("ErrorIn-isAdmin : ",error)
    return res.status(400).json({
        success:false,
        message:error.message,
        errorIn:"isAdmin fn"
    })
    }
}
// export const IsGuest = async (req,res,next)=>{
    
// }
export const IsRoot = async (req,res,next)=>{
        try {
        // check for email and org_id
        const org_id = req.body.org_id || req.headers?.org_id;
        // console.log("Body for root: ",req.body,req.headers)
         const {email, hardware} = req.user;
        if(hardware){
            console.log("This hardware by pass Root");
            next();
        }
        if(!org_id || !email){
            return res.status(404).json({
                success:false,
                message:"Org_id or email is missing!"
            })
        }
        // fetch the userOrg Role
        const userOrgRole = await UserOrgRepository.getById({org_id,email});
        if(!userOrgRole){
            return res.status(404).json({
                success:false,
                message:"User does not exit in this org!"
            })
        }

        // isAdmin or root
        if(userOrgRole?.role===roles.SUPER_ADMIN){
            next();
        }else{
              return res.status(400).json({
                success:false,
                message:"This is protected route you dont have access!",
                yourRole:userOrgRole?.role
            
            })
        }
        

    } catch (error) {
        console.error("ErrorIn-IsRoot : ",error)
    return res.status(400).json({
        success:false,
        message:error.message,
        errorIn:"IsRoot fn"
    })
    }
}
export const IsController = async (req,res,next)=>{
        try {
        // check for email and org_id
       const org_id = req.body.org_id || req.headers?.org_id;   
        const {email, hardware} = req.user;
        if(hardware){
            console.log("This hardware by pass Controller");
            next();
            return;
        }
        if(!org_id || !email){
            return res.status(404).json({
                success:false,
                message:"Org_id or email is missing!"
            })
        }
        // fetch the userOrg Role
        const userOrgRole = await UserOrgRepository.getById({org_id,email});
        if(!userOrgRole){
            return res.status(404).json({
                success:false,
                message:"User does not exit in this org!"
            })
        }

        // isAdmin or root
        if(userOrgRole?.role===roles.CONTROLLER|| userOrgRole?.role===roles.ADMIN || userOrgRole?.role===roles.SUPER_ADMIN){
            next();
        }else{
              return res.status(400).json({
                success:false,
                message:"This is protected route you dont have access!",
                yourRole:userOrgRole?.role
            
            })
        }
        

    } catch (error) {
        console.error("ErrorIn-IsController : ",error)
    return res.status(400).json({
        success:false,
        message:error.message,
        errorIn:"IsController fn"
    })
    }
}
//  guest -> controller -> admin -> root
export async function verifyAuth(req,res,next){
    try {
       const token = req.cookies?.access_token ||
                    req.header("Authorization")?.replace("Bearer ","");
        console.log("=== AUTH MIDDLEWARE ===");
        console.log("Token received:", token);
        console.log("Cookies:", req.cookies);
        console.log("Authorization header:", req.header("Authorization"));
        console.log("Hardware: ",req.header("hardware"))

        const hardware = req.header("hardware");
        if(hardware){
            req.user = {
                hardware:HARDWARE
            }
            next();
            return;
        }
        if (!token) {
            console.log("No token found");
            return res.status(400).json({
                success:false,
                message:"No token provided",
            })
        }
        
        try {
            const decoded = await verify(token,process.env.JWT_SECRET_KEY);
            console.log("Decoded token:", decoded);
            req.user = decoded;
            next(); // move to next 
        } catch (error) {
            console.log("Token verification failed:", error.message);
            return res.status(400).json({
                success:false,
                message:"Decoded failed "+error.message,
            })
        } 
    } catch (error) {
        console.log("ErrorIn : ",error)
    return res.status(400).json({
        success:false,
        message:error.message,
        errorIn:"verifyAuth fn"
    })
    }
}