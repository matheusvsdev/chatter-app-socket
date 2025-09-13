import { Server } from "socket.io";

export function setupSocket(io: Server) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      socket.join(userId); // cada usuário entra na sua própria sala
      console.log(`Usuário ${userId} conectado ao socket`);
    }

    socket.on("disconnect", () => {
      console.log("Usuário desconectado do socket");
    });
  });
}
