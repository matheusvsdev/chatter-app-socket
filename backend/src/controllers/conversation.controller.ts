import { Response } from "express";
import { IGetUserAuthInfoRequest } from "../utils/user-request.util";
import Conversation from "../models/conversation.model";

export const getConversations = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "name phone imgUrl")
      .populate("lastMessage");

    // Formata a resposta para remover o próprio usuário da lista de participantes
    const formattedConversations = conversations.map((convo) => {
      const user = convo.participants.find(
        (p: any) => p._id.toString() !== userId
      ) as any;
      return {
        id: convo._id,
        user,
        lastMessage: convo.lastMessage,
        type: convo.type,
      };
    });

    res.status(200).json({ conversations: formattedConversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar conversas" });
  }
};
