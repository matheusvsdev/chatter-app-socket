import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Conteúdo da mensagem é obrigatório"),
  receiverId: z.string().optional(),
  conversationId: z.string().optional(),
});
