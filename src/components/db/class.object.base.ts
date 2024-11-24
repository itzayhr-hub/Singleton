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

	protected constructor(_data?: Partial<BaseObject>) {
		if (_data) {
			const _idField = (this.constructor as typeof BaseObject).idIdentityName;
			if (_idField && _data[_idField]) {
				this.#idIdentity = _data[_idField] as number;
				this.storeInstance();
			}
			Object.assign(this, _data);
		}
	}

	/**
	 * Método para obtener el ID de la instancia actual
	 */
	public getId(): number | undefined {
		return this.#idIdentity;
	}

	/**
	 * Método estático para obtener propiedades permitidas de la clase hija
	 */
	protected static getProperties(): string[] {
		return this.columns;
	}

	private validateProperties(): void {
		const validColumns = (this.constructor as typeof BaseObject).getProperties();

		// Comprobamos que todas las propiedades del objeto sean válidas
		for (const prop in this) {
			if (!validColumns.includes(prop)) {
				throw new Error(`La propiedad '${prop}' no es válida para la clase ${this.constructor.name}.`);
			}
		}
	}

	/**
	 * Método genérico para obtener una instancia por ID.
	 * Usa un tipo genérico para inferir la clase hija.
	 */
	public static async getInstance<T extends BaseObject>(this: new (_data: Partial<T>) => T, _id?: number): Promise<T> {
		if (!_id) {
			return new this({});
		}

		const _className = this.name;

		// Verificar si la instancia ya está en caché
		if (BaseObject.instances && BaseObject.instances[_className] && BaseObject.instances[_className]?.[_id]) {
			return BaseObject.instances[_className][_id] as T;
		}

		// Si no está en la caché, obtenerla de la base de datos
		return BaseObject.getInstanceFromDB(_id, this);
	}

	private static async getInstanceFromDB<T extends BaseObject>(_id: number, _classConstructor: new (_data: Partial<T>) => T): Promise<T> {
		const _db: any = DB.getInstance(); // Usamos cualquier tipo, ya que DB es un singleton

		const _idIdentityName = (_classConstructor as any).idIdentityName; // Accedemos al nombre de la llave primaria a través del constructor de la clase
		if (!_idIdentityName) {
			throw new Error(`Llave primaria de la tabla no definida por el objeto ${_classConstructor.name}`);
		}

		const _tableName = (_classConstructor as any).tableName; // Accedemos al nombre de la tabla a través del constructor de la clase
		if (!_tableName) {
			throw new Error(`Nombre de tabla no definido por el objeto ${_classConstructor.name}`);
		}

		const _result = await _db.query(`SELECT * FROM ${_tableName} WHERE ${_idIdentityName} = ?`, [_id]);
		if (_result.length === 0) {
			throw new Error(`No se encontró el registro con ${_idIdentityName} = ${_id} en la tabla ${_tableName}`);
		}

		return new _classConstructor(_result[0]); // Usamos el constructor de la clase hija para crear la instancia
	}

	/**
	 * Método para guardar la instancia en el registro estático
	 */
	private storeInstance(): void {
		const _classConstructor = this.constructor as typeof BaseObject;
		const _className = _classConstructor.name;
		if (!this.#idIdentity) return;

		// Accedemos a la propiedad estática 'instances' desde el constructor
		if (!_classConstructor.instances[_className]) {
			_classConstructor.instances[_className] = {};
		}

		_classConstructor.instances[_className][this.#idIdentity] = this;
	}

	/**
	 * Método estático para eliminar una instancia del registro
	 */
	public async removeInstance(id?: number) {
		const _classConstructor = this.constructor as typeof BaseObject;
		const _className = this.constructor.name;

		if (!_classConstructor.instances[_className]) return;

		if (id && _classConstructor.instances[_className][id]) {
			delete _classConstructor.instances[_className][id];
		}
	}

	/**
	 * Método para guardar el objeto
	 */
	public async save(): Promise<boolean> {
		this.validateProperties();

		const db = DB.getInstance(); // Obtenemos la instancia de la base de datos
		const tableName = (this.constructor as typeof BaseObject).tableName;

		if (!tableName) {
			throw new Error(`Nombre de tabla no definido por el objeto ${this.constructor.name}`);
		}

		if (this.#idIdentity) {
			return await this._update(db, tableName);
		} else {
			return await this._insert(db, tableName);
		}
	}

	/**
	 * Función para insertar un nuevo registro
	 */
	private async _insert(_db: any, _tableName: string): Promise<boolean> {
		const _columns = Object.keys(this).filter((key) => key !== this.idIdentityName);
		const _placeholders = _columns.map(() => "?").join(", ");
		const _values = _columns.map((key) => this[key]);

		const _query = `INSERT INTO ${_tableName} (${_columns.join(", ")}) VALUES (${_placeholders})`;
		const _result = await _db.query(_query, _values);

		if (_result.affectedRows > 0) {
			this.#idIdentity = _result.insertId;
			this.storeInstance();
			return true;
		}

		return false;
	}

	/**
	 * Función para actualizar un registro existente
	 */
	private async _update(_db: any, _tableName: string): Promise<boolean> {
		const _classConstructor = this.constructor as typeof BaseObject;
		const _columns = Object.keys(this).filter((key) => key !== _classConstructor.idIdentityName);
		const _placeholders = _columns.map((key) => `\`${key}\` = ?`).join(", ");
		const _values = _columns.map((key) => this[key]);

		const _query = `UPDATE ${_tableName} SET ${_placeholders} WHERE ${_classConstructor.idIdentityName} = ?`;
		_values.push(this.#idIdentity);
		console.log(_query);
		console.log(_values);

		const _result = await _db.query(_query, _values);
		return _result.affectedRows > 0;
	}
}
