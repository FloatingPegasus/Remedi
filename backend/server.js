import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import reminderRouter from "./routes/reminderRoute.js";
import aiRouter from "./routes/aiRoute.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://remedi-main.vercel.app",
      "https://remedi-admin.vercel.app"
    ],
    credentials: true
  })
);

// ✅ Allow JSON body
app.use(express.json());

// ✅ Initialize server
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    // ✅ API routes
    app.use("/api/user", userRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/doctor", doctorRouter);
    app.use("/api/reminders", reminderRouter);
    app.use("/api/ai", aiRouter);

    // ✅ Health check
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "API Working",
        endpoints: {
          user: "/api/user",
          admin: "/api/admin",
          doctor: "/api/doctor"
        }
      });
    });

    // ✅ Global error handler
    app.use((err, req, res, next) => {
      console.error("❌ Unhandled error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    });

    app.listen(port, () => {
      console.log(`✅ Server running on PORT: ${port}`);
    });
  } catch (error) {
    console.error("❌ Server failed:", error.message);
    process.exit(1);
  }
};

startServer();
