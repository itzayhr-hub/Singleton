// routes.ts
import { Router } from "express";

const routerProduct = Router();

routerProduct.get("/id", ProductController.getProductById);
routerProduct.get("/sku", ProductController.getProductBySku);
routerProduct.get("", ProductController.getAllProducts);
routerProduct.post("", ProductController.addProduct);

export default routerProduct;
