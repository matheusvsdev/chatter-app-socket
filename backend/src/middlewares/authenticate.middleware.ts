import { Response, NextFunction } from "express";
import { IGetUserAuthInfoRequest } from "../utils/user-request.util";
import { verifyJwtToken } from "../utils/jwt.util";

export const authenticateToken = (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  try {
    const user = verifyJwtToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido" });
  }
};
