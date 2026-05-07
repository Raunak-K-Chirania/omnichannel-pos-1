import mongoose,{Document,Schema} from "mongoose";
export interface IInventory extends Document {
    product:mongoose.Types.ObjectId;
    store:mongoose.Types.ObjectId;
    sku:string;
    quantity:number;
    reorderPoint:number;
    lastUpdated:Date;
}
const InventorySchema:Schema<IInventory> = new Schema<IInventory>({
    product:{
        type: Schema.Types.ObjectId,
        ref:"Product",
        required:true,
    },
    store:{
        type: Schema.Types.ObjectId,
        ref:"Store",
        required:true,
    },
    sku:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
        default:0,
    },
    reorderPoint:{
        type:Number,
        required:true,
        default:10,
    },
    lastUpdated:{
        type:Date,
        default:Date.now,
    },
},{
    timestamps:true,
});
// compound  unique index on (product + store + sku)
InventorySchema.index({
    product:1,
    store:1,
    sku:1,
},{
    unique:true,
});
const Inventory = mongoose.model<IInventory>("Inventory",InventorySchema);
export default Inventory;
