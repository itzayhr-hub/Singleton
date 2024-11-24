import * as components from "./components";
import * as modules from "./modules";

declare global {
	//Components
	const Functions: typeof components.Functions;
	const DB: typeof components.DB;

	//Controllers
	const ProductController: typeof modules.ProductController;

	//Objects
	const ProductObject: typeof modules.ProductObject;
	const PlatformObject: typeof modules.PlatformObject;

	interface Global {
		//Components
		Functions: typeof components.Functions;
		DB: typeof components.DB;

		//Controllers
		ProductController: typeof modules.ProductController;

		//Objects
		ProductObject: typeof modules.ProductObject;
		PlatformObject: typeof modules.PlatformObject;
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
