import { Request, Response } from "express";
import User from "../models/user.model";
import { IGetUserAuthInfoRequest } from "../utils/user-request.util";

export const getMyProfile = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Erro ao obter perfil:", err);
    return res.status(500).json({ message: "Erro ao obter dados do usuário." });
  }
};

export const searchUserByPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res
        .status(400)
        .json({ error: "Parâmetro 'phone' é obrigatório." });
    }

    const user = await User.findOne({ phone: phone });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};
