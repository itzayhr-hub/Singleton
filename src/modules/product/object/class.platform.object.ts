import { BaseObject } from "../../../components";
import PlatformModel from "../model/class.platform.model";

export default class PlatformObject extends BaseObject {
	protected static tableName = "plataformas";
	protected static idIdentityName = "id_platform";
	protected static model = PlatformModel;
	static columns = ["id_platform", "platform", "platform_label"];

	constructor(data?: Partial<PlatformObject>) {
		super(data);
		if (data) {
			Object.assign(this, data);
		}
	}
}
