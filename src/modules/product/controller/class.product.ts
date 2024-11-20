import { Request, Response } from "express";

class ProductController {
	public static async getProductById(request: Request, response: Response): Promise<void> {
		try {
			const { id_product } = request.query;
			const product = await ProductObject.getInstance(Number(id_product));

			if (!product) {
				Functions.buildResponse({ response, status: false, message: "Producto no encontrado", statusCode: 404, data: null });
				return;
			}
			Functions.buildResponse({ response, status: true, message: "Producto encontrado", statusCode: 200, data: product });
			return;
		} catch (error: any) {
			Functions.buildResponse({ response, status: false, message: error.message || "Algo falló", statusCode: 400, data: null });
		}
	}

	public static async getProductBySku(request: Request, response: Response): Promise<void> {
		try {
			const { sku } = request.query;
			const product = await ProductObject.getInstanceBySku(String(sku));
			if (!product) {
				Functions.buildResponse({ response, status: false, message: "Producto no encontrado", statusCode: 404, data: null });
				return;
			}
			Functions.buildResponse({ response, status: true, message: "Producto encontrado", statusCode: 200, data: product });
			return;
		} catch (error: any) {
			Functions.buildResponse({ response, status: false, message: error.message || "Algo falló", statusCode: 400, data: null });
		}
	}

	public static async getAllProducts(_request: Request, response: Response): Promise<void> {
		try {
			const result = await ProductObject.getAllProducts();

			if (!result) {
				Functions.buildResponse({ response, status: false, message: "Lista de productos no encontrados", statusCode: 404, data: null });
				return;
			}

			const { products, total } = result;
			Functions.buildResponse({ response, status: true, message: "Lista de productos", statusCode: 200, data: { products, total } });
			return;
		} catch (error: any) {
			Functions.buildResponse({ response, status: false, message: error.message || "Algo falló", statusCode: 400, data: null });
		}
	}

	public static async addProduct(_request: Request, response: Response): Promise<void> {
		try {
			const product = await ProductObject.getInstance();
			product.sku = "STM-1";
			product.name = "Título";
			product.price = 999;
			product.id_platform = 1;
			const saved = await product.save();

			if (!saved) {
				Functions.buildResponse({ response, status: false, message: "Producto no agregado", statusCode: 404, data: null });
				return;
			}
			Functions.buildResponse({ response, status: true, message: "Producto agregado", statusCode: 200, data: product });
			return;
		} catch (error: any) {
			Functions.buildResponse({ response, status: false, message: error.message || "Algo falló", statusCode: 400, data: null });
		}
	}
}

export default ProductController;
