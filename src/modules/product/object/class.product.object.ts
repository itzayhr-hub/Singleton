import ProductModel from "../model/class.product.model";
import { BaseObject } from "../../../components";

class ProductObject extends BaseObject {
	protected static tableName = "productos";
	protected static idIdentityName = "id_product";
	protected static model = ProductModel;
	static columns = ["id_product", "sku", "name", "price", "id_platform"];

	constructor(data?: Partial<ProductObject>) {
		super(data);
		if (data) {
			Object.assign(this, data);
		}
	}

	public static async getInstanceBySku(sku: string) {
		const result = await this.model.getProductBySku(sku);

		if (!result?.[this.idIdentityName]) {
			return Functions.errorNoRegister(null, this.tableName);
		}

		return new this(result);
	}

	public static async getAllProducts() {
		const { items, total } = await this.model.getAllProducts();

		if (!items || items.length <= 0) {
			throw Error("No se encontraron productos");
		}

		const products = items.map((product) => {
			return new this(product);
		});

		return { products, total };
	}
}

export default ProductObject;
