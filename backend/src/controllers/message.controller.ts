import { Response } from "express";
import { IGetUserAuthInfoRequest } from "../utils/user-request.util";
import { sendMessageSchema } from "../schemas/message.schema";
import { getOrCreateConversation } from "../services/conversation.service";
import Message from "../models/message.model";
import Conversation from "../models/conversation.model";
import User from "../models/user.model";
import { Server } from "socket.io";

export const sendMessage =
  (io: Server) => async (req: IGetUserAuthInfoRequest, res: Response) => {
    const parseResult = sendMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(422).json({
        message: "Dados inválidos",
        errors: parseResult.error.issues,
      });
    }

    const { content, receiverId, conversationId } = parseResult.data;
    const senderId = req.user?.id;
    let finalConversationId: string;
    let recipientUser: any;

    try {
      if (conversationId) {
        const existingConversation = await Conversation.findById(
          conversationId
        );
        if (
          !existingConversation ||
          !existingConversation.participants.includes(senderId || "")
        ) {
          return res
            .status(404)
            .json({ error: "Conversa não encontrada ou acesso negado" });
        }

        finalConversationId = existingConversation._id.toString();
        recipientUser = await User.findById(
          existingConversation.participants.find(
            (p) => p.toString() !== senderId
          )
        );
      } else if (receiverId) {
        const conversation = await getOrCreateConversation(
          senderId || "",
          receiverId
        );
        finalConversationId = conversation._id.toString();
        recipientUser = await User.findById(receiverId);
      } else {
        return res
          .status(400)
          .json({ error: "Destinatário ou conversa não especificados" });
      }

      const newMessage = new Message({
        conversationId: finalConversationId,
        senderId,
        content,
        sentAt: new Date(),
      });

      await newMessage.save();

      await Conversation.findByIdAndUpdate(finalConversationId, {
        lastMessage: newMessage._id,
        updatedAt: new Date(),
      });

      io.to(senderId || "").emit("newMessage", {
        conversationId: finalConversationId,
        message: newMessage,
      });

      if (recipientUser) {
        io.to(recipientUser._id.toString()).emit("newMessage", {
          conversationId: finalConversationId.toString(),
          message: newMessage,
        });
      }

      return res.status(201).json({
        message: {
          id: newMessage._id,
          content: newMessage.content,
          senderId: newMessage.senderId,
          conversationId: newMessage.conversationId,
          sentAt: newMessage.sentAt,
        },
      });
    } catch (err) {
      console.error("Erro no envio de mensagem:", err);
      return res.status(500).json({ error: "Erro no envio de mensagem" });
    }
  };

// Buscar mensagens de uma conversa específica
export const getMessagesByConversationId = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    // Garante que o usuário é participante da conversa
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ error: "Conversa não encontrada ou acesso negado" });
    }

    const messages = await Message.find({ conversationId }).sort({ sentAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar mensagens da conversa" });
  }
};
