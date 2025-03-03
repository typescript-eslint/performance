import { CaseData } from "../../data.js";
import { Structure } from "../../writing/writeStructure.js";
import { createESLintConfigFile } from "../files/createESLintConfigFile.js";
import { createStandardTSConfigFile } from "../files/createStandardTSConfigFile.js";
import { range } from "../utils.js";

export function writeEvenCaseFiles(data: CaseData): Structure {
	const topLevelWidth = Math.floor(Math.log(data.files) * 1.7);

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
			"index.ts": [createIndexFile(topLevelWidth), "typescript"],
			...Object.fromEntries(
				new Array(topLevelWidth)
					.fill(undefined)
					.map((_, index) => [
						`example${index}`,
						createExampleDirectory(index),
					]),
			),
		},
		"tsconfig.json": [createStandardTSConfigFile(), "json"],
	};
}

function createExampleDirectory(index: number): Structure {
	return {
		"index.ts": [createExampleFile(index), "typescript"],
		...(index > 2 &&
			Object.fromEntries(
				range(1, index).map((i) => [
					`nested${i}`,
					createExampleDirectory(i - 1),
				]),
			)),
	};
}

function createExampleFile(index: number) {
	return [
		index > 1 &&
			range(1, index)
				.map((i) => `export * as nested${i} from "./nested${i}/index.js";`)
				.join("\n\t\t"),
		`
			export async function example${index}(prefix: string) {
				await Promise.resolve();
				return prefix + "" + ${index};
			}
		`,
	]
		.filter(Boolean)
		.join("\n\n");
}

function createIndexFile(count: number) {
	const indices = range(0, count);

	return `
		import { example0 } from "./example0/index.js";
		
		export async function root() {
			// Lint report: no-floating-promises
			example0("");

			// No lint report
			await example0("");
		}

		${indices.map((index) => `export { example${index} } from "./example${index}/index.js";`).join("\n\t\t")}
	`;
}
