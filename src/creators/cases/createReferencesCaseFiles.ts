import { CaseData } from "../../data.js";
import { Structure } from "../../writing/writeStructure.js";
import { createESLintConfigFile } from "../files/createESLintConfigFile.js";
import { createStandardTSConfigFile } from "../files/createStandardTSConfigFile.js";
import { range } from "../utils.js";

function createExampleFile(index: number) {
	return [
		index > 2 &&
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
	const indices = count > 1 ? range(0, count - 1) : [];

	return `
		import { example0 } from "./nested0/index.js";
		
		export async function root() {
			// Lint report: no-floating-promises
			example0("");

			// No lint report
			await example0("");
		}

		${indices.map((index) => `export * as nested${index} from "./nested${index}/index.js";`).join("\n\t\t")}
	`;
}

function createNestedDirectory(index: number): Structure {
	return {
		"index.ts": [createExampleFile(index), "typescript"],
		...(index > 2 &&
			Object.fromEntries(
				range(1, index).map((i) => [
					`nested${i}`,
					createNestedDirectory(i - 1),
				]),
			)),
	};
}

function createProjectDirectory(index: number): Structure {
	return {
		src: {
			"index.ts": [createIndexFile(index), "typescript"],
			...(index > 2 &&
				Object.fromEntries(
					range(0, index - 1).map((i) => [
						`nested${i}`,
						createNestedDirectory(i),
					]),
				)),
		},
		"tsconfig.json": [
			{
				extends: "../../tsconfig.build.json",
				include: ["src"],
			},
			"json",
		],
	};
}

export function createReferencesCaseFiles(data: CaseData): Structure {
	const topLevelWidth = Math.ceil(
		Math.log(data.files) * (data.files > 1000 ? 1.6 : 1.7),
	);
	const projectNames = range(0, topLevelWidth).map((i) => `project-${i}`);

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
		"tsconfig.build.json": [
			{ ...createStandardTSConfigFile(), include: undefined },
			"json",
		],
		...(data.types === "service"
			? {
					"tsconfig.json": [
						{
							include: [],
							references: projectNames.map((projectName) => ({
								path: `./src/${projectName}`,
							})),
						},
						"json",
					],
				}
			: {
					"tsconfig.eslint.json": [createStandardTSConfigFile(), "json"],
					"tsconfig.json": [createStandardTSConfigFile(), "json"],
				}),
		src: {
			...Object.fromEntries(
				projectNames.map((projectName, index) => [
					projectName,
					createProjectDirectory(index),
				]),
			),
		},
	};
}
