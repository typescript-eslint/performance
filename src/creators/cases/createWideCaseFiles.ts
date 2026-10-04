import type { CaseData } from "../../data.ts";
import type { Structure } from "../../writing/writeStructure.ts";

import { createESLintConfigFile } from "../files/createESLintConfigFile.ts";
import { createFrameworkFile } from "../files/createFrameworkFile.ts";
import {
	createModuleCycle,
	type ModuleCreator,
} from "../files/createModuleFile.ts";
import { createStandardTSConfigFile } from "../files/createStandardTSConfigFile.ts";

export function writeWideCaseFiles(data: CaseData): Structure {
	const createModule = createModuleCycle();

	return {
		"eslint.config.js": [
			createESLintConfigFile({
				rules: data.rules,
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
						[createExampleFile(index, createModule), "typescript"],
					]),
			),
		},
		"tsconfig.json": [createStandardTSConfigFile(), "json"],
		types: {
			"framework.d.ts": [createFrameworkFile(), "typescript"],
		},
	};
}

function createExampleFile(index: number, createModule: ModuleCreator) {
	const parent = Math.floor((index - 1) / 2);

	return createModule(
		index,
		index > 0 ? [{ index: parent, path: `./example${parent}.js` }] : [],
	);
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
