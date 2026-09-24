import { table } from "console-table-without-index";
import { execa } from "execa";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
	type CaseData,
	casesPath,
	getComparison,
	getComparisonCases,
} from "./data.ts";
import { createProjectName } from "./utils.ts";

interface Measurement {
	mean: number;
	stddev: number;
}

function formatMeasurement({ mean, stddev }: Measurement) {
	return `${mean.toFixed(3)} s ± ${stddev.toFixed(3)} s`;
}

async function runProjectLint(data: CaseData): Promise<Measurement> {
	const projectName = createProjectName(data);
	const exportPath = path.join(
		await fs.mkdtemp(path.join(os.tmpdir(), "performance-")),
		"results.json",
	);

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
		"--export-json",
		exportPath,
	]);

	if (result.exitCode) {
		console.log(result.stderr);
		throw new Error(`hyperfine failed for ${projectName}.`);
	}

	const { results } = JSON.parse(await fs.readFile(exportPath, "utf8")) as {
		results: Measurement[];
	};

	return results[0];
}

const comparison = getComparison();
const measurements = new Map<string, Measurement>();

for (const data of getComparisonCases(comparison)) {
	measurements.set(createProjectName(data), await runProjectLint(data));
}

const rows = comparison.files.flatMap((files) =>
	comparison.rules.map((rules) => {
		const row: Record<string, unknown> = { files, rules };
		const means: Partial<Record<CaseData["types"], number>> = {};

		for (const types of comparison.types) {
			const measurement = measurements.get(
				createProjectName({
					files,
					layout: comparison.layout,
					rules,
					singleRun: comparison.singleRun,
					types,
				}),
			);
			if (measurement) {
				row[`${types} (${comparison.layout} layout)`] =
					formatMeasurement(measurement);
				means[types] = measurement.mean;
			}
		}

		if (means.native && means.service) {
			row["native / service"] = `${(means.native / means.service).toFixed(2)}x`;
		}

		return row;
	}),
);

console.log(`Comparison: ${comparison.description}`);
console.table(table(rows));
