import path from "node:path";

import { localTypeScriptESLintPath, NamedCaseData } from "../../data.js";

export function createPackageFile(data: NamedCaseData) {
	return {
		devDependencies: {
			"@eslint/js": "*",
			eslint: "*",
			typescript: "*",
			"typescript-eslint": localTypeScriptESLintPath
				? localPackageSpecifier(localTypeScriptESLintPath)
				: "latest",
		},
		name: data.name,
		private: true,
		scripts: {
			lint: "eslint src",
		},
		type: "module",
	};
}

function localPackageSpecifier(checkout: string) {
	return `file:${path.relative(
		path.join("cases", "case"),
		path.join(checkout, "packages", "typescript-eslint"),
	)}`;
}
