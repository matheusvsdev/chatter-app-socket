import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { upload } from "../utils/storage.util";

const router = Router();

router.post("/register", upload.single("imgUrl"), register);
router.post("/login", login);

export default router;
