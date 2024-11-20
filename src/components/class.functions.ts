import { Response } from "express";

export default class Functions {
	public static buildResponse({ response, status = false, message = "", statusCode = 400, data = null }: { response: Response; status: boolean; message: string; statusCode: number; data: any | null }) {
		return response.status(statusCode).json({ status, message, data });
	}

	public static errorNoRegister(id: number | null, tableName: string) {
		throw new Error(`Registro${id ? ` con ID ${id}` : ""} no fue encontrado en la tabla "${tableName}".`);
	}
}
