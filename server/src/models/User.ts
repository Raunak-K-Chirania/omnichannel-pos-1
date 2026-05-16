import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "cashier" | "manager" | "admin";
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "cashier" | "manager" | "admin";
  store: mongoose.Types.ObjectId;
  matchPassword(candidatePassword: string): Promise<boolean>;
}
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["cashier", "manager", "admin"],
      default: "cashier",
    },
    store: {
      type:Schema.Types.ObjectId,
      ref: "Store",
    },
  },
  { timestamps: true },
);
// pre save hook to hash password
UserSchema.pre("save", async function (next) {
     if (!this.isModified("password")) {
    return next();
     }
     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
     next();
});
// method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};
//model
const User = mongoose.model<IUser>("User", UserSchema);
export default User;