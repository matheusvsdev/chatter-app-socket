import "dotenv/config";
import http from "http";
import app from "./app";
import connectDB from "./config/database";
import { Server } from "socket.io";
import { setupSocket } from "./web/socket";
import fs from "fs";

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const port = process.env.PORT || 3100;

async function startServer() {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  setupSocket(io); // socket funcionando

  server.listen(port, () => {
    console.log(`Servidor Express + Socket.IO rodando na porta ${port}`);
  });
}

startServer();
