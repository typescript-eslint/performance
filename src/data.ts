export const casesPath = "cases";

/**
 * Absolute path to a local typescript-eslint checkout, from
 * `TYPESCRIPT_ESLINT_PATH`. When set, cases depend on that build rather than
 * the published `typescript-eslint`, which is how an unreleased change can be
 * measured against the existing baselines.
 */
export const localTypeScriptESLintPath =
	process.env.TYPESCRIPT_ESLINT_PATH ?? undefined;

export const caseEntries = [
	{
		label: "files",
		values: [1024],
	},
	{
		label: "layout",
		values: ["even"],
	},
	{
		label: "singleRun",
		values: [false],
	},
	{
		label: "types",
		values: ["project", "service"],
	},
] as const;

export interface CaseData {
	files: number;
	layout: "even" | "references" | "wide";
	singleRun: boolean;
	types: "project" | "service";
}

export type CaseEntry = (typeof caseEntries)[number];

export interface NamedCaseData extends CaseData {
	name: string;
}
