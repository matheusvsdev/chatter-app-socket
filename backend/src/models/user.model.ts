import { Schema, model, InferSchemaType } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema({
  imgUrl: String,
  name: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10,11}$/,
  },
  password: { type: String, required: true },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false });
  return {
    id: obj._id,
    imgUrl: obj.imgUrl,
    name: obj.name,
    phone: obj.phone,
  };
};

type IUser = InferSchemaType<typeof UserSchema>;

const User = model<IUser>("User", UserSchema);

export default User;
