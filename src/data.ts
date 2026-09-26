export const casesPath = "cases";

export const localTypeScriptESLintPath =
	process.env.TYPESCRIPT_ESLINT_PATH ?? undefined;

export const nativePreviewVersion =
	process.env.TYPESCRIPT_NATIVE_VERSION ?? "7.1.0-dev.20260923.1";

export interface CaseData {
	files: number;
	layout: "even" | "references" | "wide";
	rules: "floating" | "recommended";
	singleRun: boolean;
	types: "native" | "project" | "service";
}

export interface Comparison {
	description: string;
	files: readonly number[];
	layout: CaseData["layout"];
	rules: readonly CaseData["rules"][];
	singleRun: boolean;
	types: readonly CaseData["types"][];
}

export interface NamedCaseData extends CaseData {
	name: string;
}

export const comparisons = {
	default: {
		description: "parserOptions.project against parserOptions.projectService",
		files: [1024],
		layout: "even",
		rules: ["floating"],
		singleRun: false,
		types: localTypeScriptESLintPath
			? ["project", "service", "native"]
			: ["project", "service"],
	},
	native: {
		description:
			"the classic project service against the TypeScript 7.1 native backend",
		files: [128, 1024],
		layout: "even",
		rules: ["floating", "recommended"],
		singleRun: false,
		types: ["service", "native"],
	},
} satisfies Record<string, Comparison>;

export type ComparisonName = keyof typeof comparisons;

export function getComparison(): Comparison & { name: ComparisonName } {
	const name = (process.argv[2] ?? "default") as ComparisonName;
	if (!Object.hasOwn(comparisons, name)) {
		throw new Error(
			`Unknown comparison '${name}'. Expected one of: ${Object.keys(comparisons).join(", ")}.`,
		);
	}
	if (name === "native" && !localTypeScriptESLintPath) {
		throw new Error(
			"The native comparison needs TYPESCRIPT_ESLINT_PATH, as the native backend is unpublished.",
		);
	}
	return { ...comparisons[name], name };
}

export function getComparisonCases(comparison: Comparison): CaseData[] {
	return comparison.files.flatMap((files) =>
		comparison.rules.flatMap((rules) =>
			comparison.types.map((types) => ({
				files,
				layout: comparison.layout,
				rules,
				singleRun: comparison.singleRun,
				types,
			})),
		),
	);
}
