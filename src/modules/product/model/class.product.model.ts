import { BaseModel } from "../../../components";

class ProductModel extends BaseModel {
	protected static tableName = "productos";
	protected static idIdentityName = "id_product";

	constructor(data?: Partial<ProductModel>) {
		super(data);
		if (data) {
			Object.assign(this, data);
		}
	}

	public static async getProductBySku(sku: string) {
		return await this.get(`sku = '${sku}'`);
	}

	public static async getAllProducts() {
		return await this.getAll("", 0, 10, `${this.idIdentityName} ASC`);
	}
}

export default ProductModel;
