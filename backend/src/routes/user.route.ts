import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticate.middleware";
import {
  getMyProfile,
  searchUserByPhone,
} from "../controllers/user.controller";

const router = Router();

router.get("/profile", authenticateToken, getMyProfile);
router.get("/user/:phone", authenticateToken, searchUserByPhone);

export default router;
