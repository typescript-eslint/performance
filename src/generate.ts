import { execa } from "execa";
import fs from "node:fs/promises";
import path from "node:path";

import type { CaseData, NamedCaseData } from "./data.ts";

import { createPackageFile } from "./creators/files/createPackageFile.ts";
import { writeCaseFiles } from "./creators/writeCaseFiles.ts";
import { caseEntries, casesPath } from "./data.ts";
import { createProjectName } from "./utils.ts";
import { writeFile } from "./writing/writeFile.ts";

async function createCase(data: NamedCaseData): Promise<NamedCaseData> {
	const name = createProjectName({
		files: data.files,
		layout: data.layout,
		singleRun: data.singleRun,
		types: data.types,
	});
	const directory = path.join(casesPath, name);

	console.log(`Populating ${name}...`);

	await fs.mkdir(path.join(directory, "src"), { recursive: true });

	await writeFile(directory, "package.json", createPackageFile(data), "json");

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
				const data: CaseData = { files, layout, singleRun, types };
				const name = createProjectName(data);
				cases.push(await createCase({ ...data, name }));
			}
		}
	}
}

await execa({ stdio: "inherit" })`npm install`;

console.log("Seeded cases.");
