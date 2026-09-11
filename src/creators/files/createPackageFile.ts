import path from "node:path";

import {
	localTypeScriptESLintPath,
	NamedCaseData,
	nativePreviewVersion,
} from "../../data.js";

export function createPackageFile(data: NamedCaseData) {
	return {
		devDependencies: {
			"@eslint/js": "*",
			eslint: "*",
			typescript: "*",
			...(data.types === "native" && {
				"@typescript/native": `npm:typescript@${nativePreviewVersion}`,
			}),
			"typescript-eslint": localTypeScriptESLintPath
				? localPackageSpecifier(localTypeScriptESLintPath)
				: "rc-v8",
		},
		name: data.name,
		private: true,
		scripts: {
			lint: "eslint src",
		},
		type: "module",
	};
}

/**
 * Cases live two directories below the repository root, so a local checkout is
 * reached from there rather than from the root.
 */
function localPackageSpecifier(checkout: string) {
	return `file:${path.relative(
		path.join("cases", "case"),
		path.join(checkout, "packages", "typescript-eslint"),
	)}`;
}
