import { v4 as uuidv4 } from "uuid";
import { OtpRepository, UserRepository } from "../models/Models.js";
import bcrypt from "bcryptjs";
import pkg from 'jsonwebtoken';
const { sign } = pkg;
// util: generate random 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
// sendOtp
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 1️⃣ Check if user already exists in Users table
    const existingUser = await UserRepository.getById({ email });
    console.log("EX USER: ", existingUser);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // 2️⃣ Generate OTP
    const otp = generateOtp();
    const now = Math.floor(Date.now() / 1000);
    const ttl = now + 5 * 60; // expires in 5 minutes
    console.log("otp: ", otp);
    // 3️⃣ Store OTP in OtpTable (reuse repo)
    const otpresult = await OtpRepository.create({
      email,
      otpId: uuidv4(), // SK if needed
      otp,
      expiresAt: ttl,
    });
    console.log("response time", otpresult);
    // 4️⃣ Response
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp, // ⚠️ for testing only
    });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again later.",
      error: error.message,
    });
  }
};

// verifyOtp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // 1️⃣ Check if user already exists
    const existingUser = await UserRepository.getById({ email }); // email is PK
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // 2️⃣ Get OTP from OtpTable
    const otpItem = await OtpRepository.getById({ email }); // email is PK
    console.log("Otp item: ", otpItem);
    if (!otpItem) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    // 3️⃣ Check OTP value
    const now = Math.floor(Date.now() / 1000);
    if (otpItem.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpItem.expiresAt < now) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // 4️⃣ Optional: Delete OTP after verification
    await OtpRepository.remove({ email });
    console.log("Otp done: ");
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again later.",
      error: error.message,
    });
  }
};
// signUp
export const signUp = async (req, res) => {
  try {
    console.log("=== SIGNUP REQUEST ===");
    console.log("Full request body received:", JSON.stringify(req.body, null, 2));
    console.log("Request body type:", typeof req.body);
    console.log("Request body keys:", Object.keys(req.body));
    
    const {
      firstName,
      lastName,
      password,
      conformPassword,
      email,
      contactNumber,
    } = req.body;

    console.log("=== EXTRACTED PARAMETERS ===");
    console.log("firstName:", firstName, "Type:", typeof firstName);
    console.log("lastName:", lastName, "Type:", typeof lastName);
    console.log("password:", password ? "[HIDDEN]" : "undefined", "Type:", typeof password);
    console.log("conformPassword:", conformPassword ? "[HIDDEN]" : "undefined", "Type:", typeof conformPassword);
    console.log("email:", email, "Type:", typeof email);
    console.log("contactNumber:", contactNumber, "Type:", typeof contactNumber);

    // Check if parameters exist and are strings
    const isFirstNameValid = firstName && typeof firstName === 'string' && firstName.trim().length > 0;
    const isLastNameValid = lastName && typeof lastName === 'string' && lastName.trim().length > 0;
    const isPasswordValid = password && typeof password === 'string' && password.trim().length > 0;
    const isConformPasswordValid = conformPassword && typeof conformPassword === 'string' && conformPassword.trim().length > 0;
    const isEmailValid = email && typeof email === 'string' && email.trim().length > 0;

    console.log("=== VALIDATION RESULTS ===");
    console.log("isFirstNameValid:", isFirstNameValid);
    console.log("isLastNameValid:", isLastNameValid);
    console.log("isPasswordValid:", isPasswordValid);
    console.log("isConformPasswordValid:", isConformPasswordValid);
    console.log("isEmailValid:", isEmailValid);

    if (!isFirstNameValid || !isLastNameValid || !isPasswordValid || !isConformPasswordValid || !isEmailValid) {
      console.log("=== MISSING REQUIRED FIELDS ===");
      console.log("Missing fields details:", { 
        firstName: isFirstNameValid, 
        lastName: isLastNameValid, 
        password: isPasswordValid, 
        conformPassword: isConformPasswordValid, 
        email: isEmailValid 
      });
      return res.status(400).json({
        success: false,
        message: "Some params missing!",
      });
    }

    if (password !== conformPassword) {
      console.log("Password mismatch");
      return res.status(400).json({
        success: false,
        message: "Password is Incorrect!",
      });
    }
    
    console.log("Checking if user already exists with email:", email);
    const existingUser = await UserRepository.getById({ email });
    console.log("Existing user check result:", existingUser);
    if (existingUser) {
      console.log("User already exists with this email");
      return res.status(400).json({
        success: false,
        message: "User Already Exists!",
      });
    }

    console.log("Generating password hash");
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    console.log("Password hash generated:", hash);

    console.log("Creating new user with data:", {
      email,
      contactNumber,
      firstName,
      lastName
    });
    
    const newUser = await UserRepository.create({
      email,
      ...(contactNumber && { contactNumber }), // Only add contactNumber if it exists
      firstName,
      lastName,
      password: hash,
    });
    console.log("New user created:", newUser);

    return res.status(201).json({
      success: true,
      message: "User Created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error in signUp: ", error);
    // Send more detailed error information for debugging
    return res.status(500).json({
      success: false,
      message: "Failed to create user. Please try again later.",
      error: {
        message: error.message,
        code: error.code,
        name: error.name
      },
    });
  }
};
// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "missing email/password!",
      });
    }

    // get user by email
    const existingUser = await UserRepository.getById({ email });
    console.log("Existing user : ", existingUser);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    const match = await bcrypt.compare(password, existingUser.password);
    console.log("Org: ",existingUser.password)
    const salt = bcrypt.genSaltSync(10)
    console.log("ent: ",bcrypt.hashSync(password,salt))
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    // create jwt token
    const token = sign(
      {
        email: existingUser.email
      },
      process.env.JWT_SECRET_KEY
      // ,{
      //     expiresIn: "24h" // set if you want to expire the token
      // }
    );
    // save the token to db
    const updatedUser = await UserRepository.update({email},{ token})
    console.log("Updated user: ",updatedUser)

    const options = {
        httpOnly:true
    }

    return res.cookie("access_token",token,options).status(200).json({
        success:true,
        message:"Login SuccessFull",
        user: updatedUser,
        token
    })


  } catch (error) {
    console.error("Error in login: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to login. Please try again later.",
      error: error.message,
    });
  }
};
// googleOuth
export const googleOuth = async (req, res) => {
  try {
    const { email } = req.body;
    if( !email){
        return res.status(404).json({
            success:false,
            message:"Email not found!"
        })
    }
    // find user
    const existingUser = await UserRepository.getById({email})
    console.log("Existing: ",existingUser)
    if(!existingUser){
        // user does not exist 
        console.warn("User does not exit!")
        // email verify as it provided by google 
        // now move to complete-profile
        return res.status(200).json({
            success:true,
            message:"User does Not exist",
            navigateTo:"complete-profile",
            state:"signUp"
        })
    }
    // user exist

    // generate token

    const token = sign(
        {
            email:existingUser.email
        },
        process.env.JWT_SECRET_KEY
        //, {
        //     expiresIn: "24h" // expire in 24 hours
        // }
    )
    console.log("Token: ",token)
    const updatedUser = await UserRepository.update({email},{token});
    const options = {
        httpOnly:true
    }
    return res.cookie("access_token",token,options).status(200).json({
        success:true,
        message:"google Login successful",
        navigateTo:"/",
        user: updatedUser,
        token,
         state:"login"
    })
  } catch (error) {
    console.error("Error in googleOuth: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to authenticate with Google. Please try again later.",
      error: error.message,
    });
  }
};