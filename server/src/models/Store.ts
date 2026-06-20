import mongoose, { Document,Schema } from "mongoose";
export interface IStore extends Document {
    name: string;
    location: string;
    isActive: boolean;
    currency: string;
}
const StoreSchema: Schema<IStore> = new Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    location:{
        type: String,
        required: true,
        trim: true,
    },
    isActive:{
        type: Boolean,
        default: true,
    },
    currency:{
        type: String,
        required: true,
        default: "USD",
        trim: true,
    }
},{timestamps: true});
//model
const Store = mongoose.model<IStore>("Store", StoreSchema);
export default Store;