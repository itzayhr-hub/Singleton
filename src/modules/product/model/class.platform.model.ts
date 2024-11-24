import { BaseModel } from "../../../components";

export default class PlatformModel extends BaseModel {
	protected static tableName = "plataformas";
	protected static idIdentityName = "id_platform";

	constructor(data?: Partial<PlatformModel>) {
		super(data);
		if (data) {
			Object.assign(this, data);
		}
	}
}
