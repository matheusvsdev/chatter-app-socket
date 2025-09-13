import { Schema, model, InferSchemaType } from "mongoose";

const ConversationSchema = new Schema({
  participants: [
    {
      type: String,
      ref: "User",
      required: true,
    },
  ],
  lastMessage: {
    type: String,
    ref: "Message",
  },
  type: {
    type: String,
    enum: ["private", "group"],
    required: true,
  },
});

type IConversation = InferSchemaType<typeof ConversationSchema>;

const Conversation = model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
