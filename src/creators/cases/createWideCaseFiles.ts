import { CaseData } from "../../data.js";
import { Structure } from "../../writing/writeStructure.js";
import { createESLintConfigFile } from "../files/createESLintConfigFile.js";
import { createStandardTSConfigFile } from "../files/createStandardTSConfigFile.js";

function createExampleFile(index: number) {
	return `
		export async function example${index}(prefix: string) {
			await Promise.resolve();
			return prefix + "" + ${index};
		}
	`;
}

function createIndexFile(count: number) {
	const indices = new Array(count - 1).fill(undefined).map((_, index) => index);

	return `
		${indices.map((index) => `import { example${index} } from "./example${index}.js";`).join("\n\t\t")}
		
		export async function root() {
			// Lint report: no-floating-promises
			example0("");

			// No lint reports
			${indices.map((index) => `await example${index}("");`).join("\n\t\t\t")}
		}
	`;
}

export function writeWideCaseFiles(data: CaseData): Structure {
	return {
		"eslint.config.js": [
			createESLintConfigFile({
				singleRun: data.singleRun,
				types:
					data.types === "service"
						? "projectService"
						: data.layout === "references"
							? "tsconfig.eslint.json"
							: true,
			}),
			"typescript",
		],
		src: {
			"index.ts": [createIndexFile(data.files), "typescript"],
			...Object.fromEntries(
				new Array(data.files - 1)
					.fill(undefined)
					.map((_, index) => [
						`example${index}.ts`,
						[createExampleFile(index), "typescript"],
					]),
			),
		},
		"tsconfig.json": [createStandardTSConfigFile(), "json"],
	};
}
