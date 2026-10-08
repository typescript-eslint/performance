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
	/** Not reported by hyperfine on Windows. */
	memory: Summary | undefined;
	time: Summary;
}

interface Summary {
	mean: number;
	stddev: null | number;
}

const bytesPerMebibyte = 1024 * 1024;

function formatMemory({ mean, stddev }: Summary) {
	return `${(mean / bytesPerMebibyte).toFixed(0)} MiB ± ${((stddev ?? 0) / bytesPerMebibyte).toFixed(0)} MiB`;
}

function formatTime({ mean, stddev }: Summary) {
	return `${mean.toFixed(3)} s ± ${(stddev ?? 0).toFixed(3)} s`;
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
		"--metrics",
		"time_wall_clock,memory_peak_resident",
		"--export-json",
		exportPath,
	]);

	if (result.exitCode) {
		console.log(result.stderr);
		throw new Error(`hyperfine failed for ${projectName}.`);
	}

	const { results } = JSON.parse(await fs.readFile(exportPath, "utf8")) as {
		results: {
			summary: {
				memory_peak_resident?: Summary;
				time_wall_clock: Summary;
			};
		}[];
	};

	const { summary } = results[0];

	return {
		memory: summary.memory_peak_resident,
		time: summary.time_wall_clock,
	};
}

const comparison = getComparison();
const measurements = new Map<string, Measurement>();

for (const data of getComparisonCases(comparison)) {
	measurements.set(createProjectName(data), await runProjectLint(data));
}

const rows = comparison.files.flatMap((files) =>
	comparison.rules.map((rules) => {
		const row: Record<string, unknown> = { files, rules };
		const measured: Partial<Record<CaseData["types"], Measurement>> = {};

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
				row[`${types} time (${comparison.layout} layout)`] = formatTime(
					measurement.time,
				);
				if (measurement.memory) {
					row[`${types} memory (${comparison.layout} layout)`] = formatMemory(
						measurement.memory,
					);
				}
				measured[types] = measurement;
			}
		}

		if (measured.native && measured.service) {
			row["native / service time"] =
				`${(measured.native.time.mean / measured.service.time.mean).toFixed(2)}x`;

			if (measured.native.memory && measured.service.memory) {
				row["native / service memory"] =
					`${(measured.native.memory.mean / measured.service.memory.mean).toFixed(2)}x`;
			}
		}

		return row;
	}),
);

console.log(`Comparison: ${comparison.description}`);
console.table(table(rows));
