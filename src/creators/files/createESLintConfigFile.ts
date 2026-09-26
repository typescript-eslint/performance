export interface ESLintConfigFileOptions {
	rules: "floating" | "recommended";
	singleRun: boolean;
	types:
		"nativeProjectService" | "projectService" | "tsconfig.eslint.json" | true;
}

export function createESLintConfigFile({
	rules,
	singleRun,
	types,
}: ESLintConfigFileOptions) {
	const usesProjectService = types !== true && types !== "tsconfig.eslint.json";

	return `
		import tseslint from "typescript-eslint";

		export default tseslint.config(
			tseslint.configs.${rules === "recommended" ? "recommendedTypeChecked" : "base"},
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
			return `projectService: { EXPERIMENTAL_backend: "native" }`;
		case "projectService":
			return `projectService: true`;
		case true:
			return `project: true`;
		default:
			return `project: "${types}"`;
	}
}
