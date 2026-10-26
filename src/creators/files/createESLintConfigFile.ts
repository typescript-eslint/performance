export interface ESLintConfigFileOptions {
	rules: "floating" | "recommended";
	singleRun: boolean;
	types:
		"projectService" | "tsconfig.eslint.json" | "tsgoProjectService" | true;
}

export function createESLintConfigFile({
	rules,
	singleRun,
	types,
}: ESLintConfigFileOptions) {
	return `
		import tseslint from "typescript-eslint";

		export default tseslint.config(
			tseslint.configs.${rules === "recommended" ? "recommendedTypeChecked" : "base"},
			{
				files: ["**/*.ts"],
				languageOptions: {
					parserOptions: {
						${singleRun ? "" : "disallowAutomaticSingleRunInference: true,"}
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
		case "tsgoProjectService":
			return `projectService: { EXPERIMENTAL_backend: "tsgo" }`;
		case "projectService":
			return `projectService: true`;
		case true:
			return `project: true`;
		default:
			return `project: "${types}"`;
	}
}
