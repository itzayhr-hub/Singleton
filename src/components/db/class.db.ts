import mysql, { Pool } from "mysql2/promise"; // Usamos la versión de promesas

class DB {
	private static instance: DB;
	private pool: Pool;

	private constructor() {
		this.pool = mysql.createPool({
			host: "localhost",
			database: "local",
			user: "root",
			password: "root",
			port: 3306, // Puerto predeterminado de MySQL
			waitForConnections: true,
			connectionLimit: 10, // Número máximo de conexiones en el pool
			queueLimit: 0, // Sin límite de cola
		});
	}

	public static getInstance(): DB {
		if (!DB.instance) {
			DB.instance = new DB();
		}
		return DB.instance;
	}

	public async query(query: string, params: any[]): Promise<any[]> {
		const [rows] = await this.pool.execute(query, params);
		return rows as any[]; // Garantizamos que retorna un arreglo
	}
}

export default DB;
