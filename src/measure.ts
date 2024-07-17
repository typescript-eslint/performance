import { table } from "console-table-without-index";
import { execa } from "execa";
import path from "node:path";

import { CaseData, caseEntries, casesPath } from "./data.js";
import { createProjectName } from "./utils.js";

async function runProjectLint(data: CaseData) {
	const projectName = createProjectName(data);

	console.log(`Measuring ${projectName}...`);

	const result = await execa({
		cwd: path.join(casesPath, projectName),
		reject: false,
	})(`hyperfine`, [
		"npm run lint",
		"--ignore-failure",
		"--show-output",
		"--warmup",
		"1",
	]);

	if (result.exitCode) {
		console.log(result.stderr);
		console.log({ result });
	}

	return (
		/[0-9.]+\s+\S+\s+±\s+[0-9.]+\s+\S+/.exec(result.stdout)?.[0] ??
		result.stdout
	);
}

const results: unknown[] = [];

for (const files of caseEntries[0].values) {
	results.push({
		files,
		"project (multi-run)": await runProjectLint({
			files,
			layout: "even",
			singleRun: false,
			types: "project",
		}),
		"project (single-run)": await runProjectLint({
			files,
			layout: "even",
			singleRun: true,
			types: "project",
		}),
		"service (multi-run)": await runProjectLint({
			files,
			layout: "even",
			singleRun: false,
			types: "service",
		}),
		"service (single-run)": await runProjectLint({
			files,
			layout: "even",
			singleRun: true,
			types: "service",
		}),
		// "project (wide)": await runProjectLint({
		// 	files,
		// 	layout: "wide",
		// 	types: "project",
		// }),
		// "service (wide)": await runProjectLint({
		// 	files,
		// 	layout: "wide",
		// 	types: "service",
		// }),
	});
}

console.table(table(results));
