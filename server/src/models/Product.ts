import mongoose,{Document,Schema} from "mongoose";
//variant interface
interface IVariant {
    size: string;
    color: string;
    sku: string;
    price: number;
    stock: number;
}
// product interface
export interface IProduct extends Document {
    name: string;
    category: string;
    description: string;
    variants: IVariant[];
    store: mongoose.Types.ObjectId;
    isActive: boolean;
}
const VariantSchema: Schema<IVariant> = new Schema({
    size: {
        type: String,
        required: true,
    },
    color:{
        type: String,
        required: true,
    },
    sku:{
        type: String,
        required: true,
        unique: true,
    },
    price:{
        type: Number,
        required: true,
    },
    stock:{
        type: Number,
        default: 0,
    }
},{ _id: false });
const ProductSchema:Schema<IProduct> = new Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    category:{
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    description:{
        type: String,
        trim: true,
    },
    variants:[VariantSchema],
    store:{
        type: Schema.Types.ObjectId,
        ref: "Store",
        required: true,
    },
    isActive:{
        type: Boolean,
        default: true,
    },
},{timestamps: true});
//text index for search
ProductSchema.index({ name: "text", category: "text"});
//model
const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;