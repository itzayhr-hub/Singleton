export default abstract class BaseModel {
	protected static tableName: string;
	protected static idIdentityName: string;
	protected static columns: string[] = [];
	[key: string]: any;

	protected constructor(data?: Partial<BaseModel>) {
		if (data) {
			Object.assign(this, data);
		}
	}

	// Función para obtener todos los registros con paginación
	public static async getAll<T extends BaseModel>(this: new (data: any) => T, wh: string, sc: number = 0, mc: number = 0, order: string = ""): Promise<{ items: T[]; total: number }> {
		const db = DB.getInstance();
		const tableName = (this as any).tableName;
		if (!tableName) {
			throw new Error(`Nombre de tabla no definido por el objeto ${this.name}`);
		}

		const idIdentityName = (this as any).idIdentityName;

		const where = wh ? `WHERE ${wh}` : "";
		const limit = mc > 0 ? `LIMIT ${sc}, ${mc}` : "";
		const orderBy = order ? `ORDER BY ${order}` : `ORDER BY ${idIdentityName} ASC`;

		const query = `SELECT SQL_CALC_FOUND_ROWS * FROM ${tableName} ${where} ${orderBy} ${limit}`;
		const rows = await db.query(query, []);

		const countResult = await db.query("SELECT FOUND_ROWS() as total", []);
		const total = countResult[0]?.total || 0;

		return { items: rows.map((row: any) => row), total };
	}

	// Función para obtener un solo registro con condiciones personalizadas
	public static async get<T extends BaseModel>(this: new (data: any) => T, where: string, params: any[] = []): Promise<T | null> {
		const db = DB.getInstance();
		const tableName = (this as any).tableName;
		if (!tableName) {
			throw new Error(`Nombre de tabla no definido por el objeto ${this.name}`);
		}

		const query = `SELECT * FROM ${tableName} WHERE ${where}`;
		console.log("query", query);
		const result = await db.query(query, params);
		if (result.length === 0) {
			Functions.errorNoRegister(null, tableName);
		}

		return result[0];
	}

	// Función para insertar un nuevo registro
	public static async set<T extends BaseModel>(this: new (data: any) => T, data: Partial<T>): Promise<number | false> {
		const db = DB.getInstance();
		const tableName = (this as any).tableName;

		if (!tableName) {
			throw new Error(`Nombre de tabla no definido por el objeto ${this.name}`);
		}

		const columns = Object.keys(data)
			.map((key) => `\`${key}\``)
			.join(", ");
		const values = Object.values(data)
			.map((value) => `'${value}'`)
			.join(", ");

		const query = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
		const result = await db.query(query, []);

		// if (result.affectedRows > 0) {
		// 	return result.insertId;
		// }

		return false;
	}

	// Función para actualizar un registro
	public static async update<T extends BaseModel>(this: new (data: any) => T, id: number, data: Partial<T>): Promise<boolean> {
		const db = DB.getInstance();
		const tableName = (this as any).tableName;

		if (!tableName) {
			throw new Error(`Nombre de tabla no definido por el objeto ${this.name}`);
		}

		// const setClause = Object.keys(data)
		// 	.map((key) => {
		// 		const value = data[key];
		// 		return `\`${key}\` = ${value === null ? "NULL" : `'${value}'`}`;
		// 	})
		// 	.join(", ");

		// const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ${id}`;
		// const result = await db.query(query, []);

		// return result.affectedRows > 0;

		return true;
	}

	// Función para eliminar un registro
	public static async delete<T extends BaseModel>(this: new (data: any) => T, id: number): Promise<boolean> {
		const db = DB.getInstance();
		const tableName = (this as any).tableName;

		if (!tableName) {
			throw new Error(`Nombre de tabla no definido por el objeto ${this.name}`);
		}

		// const query = `DELETE FROM ${tableName} WHERE id = ${id}`;
		// const result = await db.query(query, []);

		// return result.affectedRows > 0;

		return true;
	}
}
