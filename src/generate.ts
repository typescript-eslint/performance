import { execa } from "execa";
import fs from "node:fs/promises";
import path from "node:path";

import { createESLintConfigFile, writeCaseFiles } from "./creators/files.js";
import { CaseData, NamedCaseData, caseEntries, casesPath } from "./data.js";
import { createProjectName } from "./utils.js";
import { writeFile } from "./writing/writeFile.js";

async function createCase(data: CaseData): Promise<NamedCaseData> {
	const name = createProjectName(data);
	const directory = path.join(casesPath, name);

	console.log(`Populating ${name}...`);

	await fs.mkdir(path.join(directory, "src"), { recursive: true });

	await writeFile(directory, "eslint.config.js", createESLintConfigFile(data));

	await writeFile(
		directory,
		"package.json",
		{
			devDependencies: {
				"@eslint/js": "*",
				eslint: "*",
				typescript: "*",
				"typescript-eslint": "rc-v8",
			},
			name,
			private: true,
			scripts: {
				lint: "eslint src",
			},
			type: "module",
		},
		"json",
	);

	await writeFile(
		directory,
		"tsconfig.json",
		{
			compilerOptions: {
				module: "NodeNext",
				noEmit: true,
				skipLibCheck: true,
				strict: true,
				target: "ESNext",
			},
			include: ["src"],
		},
		"json",
	);

	console.log("Created", await writeCaseFiles(data, directory), "files");

	return { ...data, name };
}

await fs.mkdir(casesPath, { recursive: true });

for (const nested of await fs.readdir(casesPath)) {
	await fs.rm(path.join(casesPath, nested), {
		force: true,
		recursive: true,
	});
}

const cases: NamedCaseData[] = [];

for (const files of caseEntries[0].values) {
	for (const layout of caseEntries[1].values) {
		for (const singleRun of caseEntries[2].values) {
			for (const types of caseEntries[3].values) {
				cases.push(await createCase({ files, layout, singleRun, types }));
			}
		}
	}
}

await execa({ stdio: "inherit" })`npm install`;

console.log("Seeded cases.");
