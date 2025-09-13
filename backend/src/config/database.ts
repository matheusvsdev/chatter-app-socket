import "dotenv/config";
import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("MongoDB conectado com sucesso!");
  } catch (err: any) {
    console.error("Erro ao conectar com o MongoDB:", err.message);
    process.exit(1);
  }
}
