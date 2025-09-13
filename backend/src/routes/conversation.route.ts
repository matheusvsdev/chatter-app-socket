import { Router } from "express";
import { getConversations } from "../controllers/conversation.controller";
import { authenticateToken } from "../middlewares/authenticate.middleware";

const router = Router();

router.get("/api/conversations", authenticateToken, getConversations);

export default router;
