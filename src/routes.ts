import { Router } from "express";
import productRouter from "./modules/product/routes/router.product";

const routes = Router();

// Registrar las rutas de todos los módulos
routes.use("/productos", productRouter);

export default routes;
