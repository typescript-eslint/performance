export interface ESLintConfigFileOptions {
	singleRun: boolean;
	types:
		"nativeProjectService" | "projectService" | "tsconfig.eslint.json" | true;
}

export function createESLintConfigFile({
	singleRun,
	types,
}: ESLintConfigFileOptions) {
	const usesProjectService = types !== true && types !== "tsconfig.eslint.json";

	return `
		import tseslint from "typescript-eslint";

		export default tseslint.config(
			tseslint.configs.base,
			{
				files: ["**/*.ts"],
				languageOptions: {
					parserOptions: {
						${!usesProjectService && !singleRun ? "disallowAutomaticSingleRunInference: true," : ""}
						${createProjectOption(types)},
						tsconfigRootDir: import.meta.dirname,
					},
				},
				rules: {
					"@typescript-eslint/no-floating-promises": "error"
				}
			},
		);
	`;
}

function createProjectOption(types: ESLintConfigFileOptions["types"]) {
	switch (types) {
		case "nativeProjectService":
			return `projectService: { backend: "native" }`;
		case "projectService":
			return `projectService: true`;
		case true:
			return `project: true`;
		default:
			return `project: "${types}"`;
	}
}
