import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import reminderRouter from "./routes/reminderRoute.js"
import aiRouter from "./routes/aiRoute.js";

// app config
const app = express()
const port = process.env.PORT || 4000

// Initialize server
const startServer = async () => {
  try {
    // Connect to database and cloudinary
    await connectDB()
    await connectCloudinary()

    // middlewares
    app.use(express.json())
    app.use(cors())

    // api endpoints
    app.use("/api/user", userRouter)
    app.use("/api/admin", adminRouter)
    app.use("/api/doctor", doctorRouter)
    app.use("/api/reminders", reminderRouter)
    app.use("/api/ai", aiRouter)

    // Health check endpoint
    app.get("/", (req, res) => {
      res.json({ 
        success: true, 
        message: "API Working",
        endpoints: {
          user: "/api/user",
          admin: "/api/admin",
          doctor: "/api/doctor"
        }
      })
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error("❌ Unhandled error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Start server
    app.listen(port, () => {
      console.log(`\n🚀 Server started successfully on PORT: ${port}`);
      console.log(`📡 API URL: http://localhost:${port}`);
      console.log(`💚 All systems ready!\n`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Start the server
startServer();