import { CaseData, CaseTypes } from "../data.js";
import { writeStructure } from "../writing/writeStructure.js";
import { writeEvenCaseFiles } from "./createEvenCaseFiles.js";
import { writeProjectsCaseFiles } from "./createProjectsCaseFiles.js";
import { writeWideCaseFiles } from "./createWideCaseFiles.js";

export function createESLintConfigFile(data: CaseData) {
	return `
		import tseslint from "typescript-eslint";

		export default tseslint.config(
			tseslint.configs.base,
			{
				files: ["**/*.ts"],
				languageOptions: {
					parserOptions: {
						${data.singleRun ? "disallowAutomaticSingleRunInference: true," : ""}
						${data.types === "service" ? "projectService" : "project"}: true,
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

const caseFileCreators = {
	even: writeEvenCaseFiles,
	projects: writeProjectsCaseFiles,
	wide: writeWideCaseFiles,
};

export async function writeCaseFiles(data: CaseData, directory: string) {
	return await writeStructure(directory, caseFileCreators[data.layout](data));
}
