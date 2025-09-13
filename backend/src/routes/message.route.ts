import { Router } from "express";
import {
  getMessagesByConversationId,
  sendMessage,
} from "../controllers/message.controller";
import { Server } from "socket.io";
import { authenticateToken } from "../middlewares/authenticate.middleware";

const router = Router();

export default (io: Server) => {
  router.post("/messages", authenticateToken, sendMessage(io));
  router.get(
    "/conversations/:conversationId/messages",
    authenticateToken,
    getMessagesByConversationId
  );
  return router;
};
