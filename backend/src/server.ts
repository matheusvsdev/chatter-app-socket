import "dotenv/config";
import app from "./app";
import connectDB from "./config/database";
import fs from "fs";

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const port = process.env.PORT || 3100;

async function startServer() {
  await connectDB();

  app.listen(port, () => {
    console.log(`Servidor Express rodando na porta ${port}`);
  });
}

startServer();
