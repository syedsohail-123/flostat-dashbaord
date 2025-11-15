
import mongoose from "mongoose";

export const  Connect = ()=>{
    mongoose.connect(process.env.MONGODB).then(()=>{
        console.log("DataBase Connected");
        
    }).catch((err)=>{
        console.log(err);
        
    })
}
// module.exports = Connect
