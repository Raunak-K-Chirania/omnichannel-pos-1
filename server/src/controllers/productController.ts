import {Request, Response} from 'express';
import Product from '../models/Product';
import redisClient from '../config/redis';

const CACHE_PREFIX = 'products:';
const CACHE_TTL = 300; // 5 minutes

// clear cache
const clearProductCache = async ()=>{
    const keys = await redisClient.keys(`${CACHE_PREFIX}*`);
    if(keys.length > 0){
        await redisClient.del(keys);
    }
};
// create a new product
// post /api/products
// access manager admin
const createProduct = async (req: Request, res: Response) : Promise<void> => {
    const product = await Product.create(req.body);
    await clearProductCache();
    res.status(201).json(product);

};
// get all products
// get /api/products
// access public
const getProducts = async (req: Request, res: Response) : Promise<void> => {
    const {search, category , cursor , limit = 20} = req.query;
    const cacheKey =`${CACHE_PREFIX}${JSON.stringify(req.query)}`;
    const cachedData = await redisClient.get(cacheKey);
    if(cachedData){
        res.json(JSON.parse(cachedData));
        return;
    }

    // buid mongoDB query
    const query: Record<string, any> = {isActive: true};
    if(search){
        query.$text = {$search: search as string};
    }
    if(category){
        query.category = category;
    }
    // cursor based pagination
  // only return products with _id greater than the cursor
    if(cursor){
        query._id = {$gt: cursor};
    }

    const products = await Product.find(query).limit(Number(limit)).sort({_id:1});
    const result ={
        products,
        nextCursor: products.length === Number(limit) ? products[products.length - 1]._id : null
    };
    // store result in redis cache
     await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    res.json(result);
};

// get product by id
// get /api/products/:id
// access public
const getProductById = async (req: Request, res: Response) : Promise<void> => {
    const product = await Product.findById(req.params.id);
    if(!product){
        res.status(404).json({message: 'Product not found'});
        return;
    }
    res.json(product);
};

// update product
// put /api/products/:id
// access manager admin
const updateProduct = async (req: Request, res: Response) : Promise<void> => {
    const product = await Product.findByIdAndUpdate(req.params.id,
        req.body,
        {new: true}    
    );
    if(!product){
        res.status(404).json({message: 'Product not found'});
        return;
    }
    await clearProductCache();
    res.json(product);
};

//delete product
// delete /api/products/:id
// access only admin
const deleteProduct = async (req: Request, res: Response) : Promise<void> => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if(!product){
        res.status(404).json({message: 'Product not found'});
        return;
    }
    await clearProductCache();
    res.json({message: 'Product deleted successfully'});
};

//
export default {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};