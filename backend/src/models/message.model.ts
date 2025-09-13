import { Schema, model, InferSchemaType } from "mongoose";

const MessageSchema = new Schema({
  conversationId: {
    type: String,
    ref: "Conversation",
    required: true,
  },
  senderId: {
    type: String,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

type IMessage = InferSchemaType<typeof MessageSchema>;

const Message = model<IMessage>("Message", MessageSchema);

export default Message;
