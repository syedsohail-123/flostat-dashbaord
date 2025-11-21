import express from "express";
import 'dotenv/config' //  to load the data to `process` variable
import authRoutes from "./routes/authRoutes.js"
import orgRoutes from "./routes/orgRoutes.js"
import userRoutes from "./routes/userRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import serverless from "serverless-http";
import cors from "cors";
const app = express();


app.use(express.json())// parser to use json
const PORT = process.env.PORT || 4000
// Configure CORS to allow credentials
app.use(cors({
  origin: ["http://localhost:5132",
    'https://awstraining.flostat.com',
    "http://localhost:56216"
  ],
  credentials: true
}));
app.get("/", (req, res) => {

  res.send("Hello world")

})

app.use('/api/demo', (req, res) => {
  res.json({
    s: "d",
    the: "f"
  })
})
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/org', orgRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/device', deviceRoutes)
app.use('/api/v1/report', reportRoutes)

// default path
// app.use('/',(req,res)=>{
//     res.send("<H1> NAMASTE </H1>")
// })


app.listen(PORT, () => {
  console.log("Connected to server");
})
export const handler = serverless(app);