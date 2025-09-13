import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import { generateJwtToken } from "../utils/jwt.util";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

export const register = async (req: Request, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(422)
      .json({ message: "Dados inválidos", errors: parseResult.error.issues });
  }

  const { name, phone, password } = parseResult.data;
  const imgUrl = req.file ? `/uploads/${req.file.filename}` : "";

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Número de celular já cadastrado." });
    }

    const newUser = new User({
      imgUrl,
      name,
      phone,
      password,
    });
    await newUser.save();

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      user: newUser,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Erro no registro de usuário" });
  }
};

export const login = async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(422)
      .json({ message: "Dados inválidos", errors: parseResult.error.issues });
  }

  const { phone, password } = parseResult.data;

  try {
    const existingUser = await User.findOne({ phone });
    if (!existingUser) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    const token = generateJwtToken({
      id: existingUser._id.toString(),
    });

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        phone: existingUser.phone,
        imgUrl: existingUser.imgUrl,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Erro no login de usuário" });
  }
};
