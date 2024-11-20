import * as components from "./components";
import * as modules from "./modules";

declare global {
	const Functions: typeof components.Functions;
	const DB: typeof components.DB;
	const BaseModel: typeof components.BaseModel;

	const ProductModel: typeof modules.ProductModel;
	const ProductObject: typeof modules.ProductObject;
	const ProductController: typeof modules.ProductController;

	interface Global {
		Functions: typeof components.Functions;
		DB: typeof components.DB;
		BaseModel: typeof components.BaseModel;

		ProductModel: typeof modules.ProductModel;
		ProductObject: typeof modules.ProductObject;
		ProductController: typeof modules.ProductController;
	}
}

const registerGlobals = (globals: Record<string, any>): void => {
	Object.entries(globals).forEach(([key, value]) => {
		(global as any)[key as keyof typeof global] = value;
	});
};

registerGlobals({
	...components,
	...modules,
});

export {};
