import { execa } from "execa";
import fs from "node:fs/promises";
import path from "node:path";

import type { CaseData, NamedCaseData } from "./data.ts";

import { createPackageFile } from "./creators/files/createPackageFile.ts";
import { writeCaseFiles } from "./creators/writeCaseFiles.ts";
import { casesPath, getComparison, getComparisonCases } from "./data.ts";
import { createProjectName } from "./utils.ts";
import { writeFile } from "./writing/writeFile.ts";

async function createCase(data: CaseData): Promise<NamedCaseData> {
	const name = createProjectName(data);
	const directory = path.join(casesPath, name);

	console.log(`Populating ${name}...`);

	await fs.mkdir(path.join(directory, "src"), { recursive: true });

	await writeFile(
		directory,
		"package.json",
		createPackageFile({ ...data, name }),
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

for (const data of getComparisonCases(getComparison())) {
	await createCase(data);
}

await execa({ stdio: "inherit" })`npm install`;

console.log("Seeded cases.");
