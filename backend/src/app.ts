import express from "express";
import cors from "cors";
import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import conversationRoute from "./routes/conversation.route";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/auth", authRoute);
app.use("/api", userRoute);
app.use("/", conversationRoute);

export default app;
