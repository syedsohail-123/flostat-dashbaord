import AWS from "aws-sdk";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const s3 = new AWS.S3();


// ✅ Multer configuration — store file temporarily
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // make sure this folder exists
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueName);
//   },
// });
// ✅ Multer configuration — store file in memory (not on disk)
const storage = multer.memoryStorage();

export const upload = multer({ storage });


// ✅ Function to upload file to S3
export const uploadFileToS3 = async (file) => {
  console.log("First head: ",file)
  // const fileContent = fs.readFileSync(file.path);
  // console.log("Upload to s3: ",fileContent)
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${file.filename || file.originalname}`,
    Body: file.buffer,  // ✅ use buffer instead of reading from disk
    ContentType: file.mimetype,
  };

  // Upload to S3
  const data = await s3.upload(params).promise();
    console.log("✅ Uploaded to S3:", data.Location);
  return data.Location; // This is the file's S3 URL
};