import Conversation from "../models/conversation.model";

export async function getOrCreateConversation(
  senderId: string,
  receiverId: string
) {
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = new Conversation({
      participants: [senderId, receiverId],
      type: "private",
    });
    await conversation.save();
  }

  return conversation;
}
