/**
 * Clase base para representar objetos de base de datos.
 * Las clases hijas deben definir `tableName`, `idIdentityName` y `columns`.
 */
export default abstract class BaseObject {
	protected static tableName: string;
	protected static idIdentityName: string;
	protected static columns: string[] = [];
	private static instances: Record<string, Record<number, BaseObject>> = {}; // Instancias por clase e ID
	#idIdentity?: number;
	[key: string]: any;

	protected constructor(data?: Partial<BaseObject>) {
		if (data) {
			const idField = (this.constructor as typeof BaseObject).idIdentityName;
			if (idField && data[idField]) {
				this.#idIdentity = data[idField] as number;
				this.storeInstance();
			}
			Object.assign(this, data);
		}
	}

	// Método para obtener el ID de la instancia actual
	public getId(): number | undefined {
		return this.#idIdentity;
	}

	// Método estático para obtener propiedades permitidas de la clase hija
	protected static getProperties(): string[] {
		return this.columns;
	}

	private validateProperties(): void {
		const validColumns = (this.constructor as typeof BaseObject).getProperties();

		// Comprobamos que todas las propiedades del objeto sean válidas
		for (const prop in this) {
			if (!validColumns.includes(prop)) {
				throw new Error(`La propiedad '${prop}' no es válida para la tabla ${this.constructor.name}.`);
			}
		}
	}

	/**
	 * Método genérico para obtener una instancia por ID.
	 * Usa un tipo genérico para inferir la clase hija.
	 */
	public static async getInstance<T extends BaseObject>(this: new (data: Partial<T>) => T, _id?: number): Promise<T> {
		const classConstructor = this.constructor as typeof BaseObject;
		const className = classConstructor.name;

		if (_id) {
			// Verificar si la instancia ya está en caché
			if (classConstructor.instances && classConstructor.instances[className] && classConstructor.instances[className]?.[_id]) {
				return classConstructor.instances[className][_id] as T;
			}

			// Si no está en la caché, obtenerla de la base de datos
			return BaseObject.getInstanceFromDB(_id, this);
		}

		return new this({});
	}

	private static async getInstanceFromDB<T extends BaseObject>(_id: number, classConstructor: new (data: Partial<T>) => T): Promise<T> {
		const db: any = DB.getInstance(); // Usamos cualquier tipo, ya que DB es un singleton

		const idIdentityName = (classConstructor as any).idIdentityName;
		if (!idIdentityName) {
			throw new Error(`Llave primaria de la tabla no definida por el objeto ${classConstructor.name}`);
		}

		const tableName = (classConstructor as any).tableName; // Accedemos al nombre de la tabla a través del constructor de la clase
		if (!tableName) {
			throw new Error(`Nombre de tabla no definido por el objeto ${classConstructor.name}`);
		}

		const result = await db.query(`SELECT * FROM ${tableName} WHERE ${idIdentityName} = ?`, [_id]);
		if (result.length === 0) {
			throw new Error(`No se encontró el registro con ${idIdentityName} = ${_id} en la tabla ${tableName}`);
		}

		return new classConstructor(result[0]); // Usamos el constructor de la clase hija para crear la instancia
	}

	// Método para guardar la instancia en el registro estático
	private storeInstance(): void {
		const classConstructor = this.constructor as typeof BaseObject;
		const className = classConstructor.name;
		if (!this.#idIdentity) return;

		// Accedemos a la propiedad estática 'instances' desde el constructor
		if (!classConstructor.instances[className]) {
			classConstructor.instances[className] = {};
		}

		classConstructor.instances[className][this.#idIdentity] = this;
	}

	// Método estático para eliminar una instancia del registro
	public async removeInstance(id?: number) {
		const classConstructor = this.constructor as typeof BaseObject;
		const className = this.constructor.name;

		console.log("classConstructor.instances", classConstructor.instances);

		if (!classConstructor.instances[className]) return;

		if (id && classConstructor.instances[className][id]) {
			delete classConstructor.instances[className][id];
		}
	}

	// Método para guardar (insertar o actualizar) el objeto
	public async save(): Promise<boolean> {
		this.validateProperties();

		const db = DB.getInstance(); // Obtenemos la instancia de la base de datos
		const tableName = (this.constructor as typeof BaseObject).tableName;

		if (!tableName) {
			throw new Error(`Nombre de tabla no definido por el objeto ${this.constructor.name}`);
		}

		if (this.idIdentity) {
			return await this.update(db, tableName); // Si tiene id, actualizamos
		} else {
			return await this.insert(db, tableName); // Si no tiene id, insertamos
		}
	}

	// Función para insertar un nuevo registro
	private async insert(db: any, tableName: string): Promise<boolean> {
		const columns = Object.keys(this).filter((key) => key !== this.idIdentityName);
		const placeholders = columns.map(() => "?").join(", ");
		const values = columns.map((key) => this[key]);

		const query = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`;
		const result = await db.query(query, values);
		if (result.affectedRows > 0) {
			this.idIdentity = result.insertId;
			return true;
		}
		return false;
	}

	// Función para actualizar un registro existente
	private async update(db: any, tableName: string): Promise<boolean> {
		const columns = Object.keys(this).filter((key) => key !== "id");
		const setClause = columns.map((key) => `\`${key}\` = ?`).join(", ");
		const values = columns.map((key) => this[key]);

		const query = `UPDATE ${tableName} SET ${setClause} WHERE ${this.idIdentityName} = ?`;
		values.push(this.idIdentity);

		const result = await db.query(query, values);
		return result.affectedRows > 0;
	}
}
