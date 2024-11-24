// routes.ts
import { Router } from "express";

const routerProduct = Router();

routerProduct.get("/getProductById", ProductController.getProductById);
routerProduct.get("/getProductBySku", ProductController.getProductBySku);
routerProduct.get("", ProductController.getAllProducts);
routerProduct.post("", ProductController.addProduct);

export default routerProduct;
