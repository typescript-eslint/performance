export interface ESLintConfigFileOptions {
	singleRun: boolean;
	types: "projectService" | "tsconfig.eslint.json" | true;
}

export function createESLintConfigFile({
	singleRun,
	types,
}: ESLintConfigFileOptions) {
	const [projectKey, projectValue] =
		types === "projectService" ? ["projectService", true] : ["project", types];

	return `
		import tseslint from "typescript-eslint";

		export default tseslint.config(
			tseslint.configs.base,
			{
				files: ["**/*.ts"],
				languageOptions: {
					parserOptions: {
						${types !== "projectService" && !singleRun ? "disallowAutomaticSingleRunInference: true," : ""}
						${projectKey}: ${typeof projectValue === "string" ? `"${projectValue}"` : projectValue},
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
