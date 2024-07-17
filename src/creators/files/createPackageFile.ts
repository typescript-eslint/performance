import { NamedCaseData } from "../../data.js";

export function createPackageFile(data: NamedCaseData) {
	return {
		devDependencies: {
			"@eslint/js": "*",
			eslint: "*",
			typescript: "*",
			"typescript-eslint": "rc-v8",
		},
		name: data.name,
		private: true,
		scripts: {
			lint: "eslint src",
		},
		type: "module",
	};
}
