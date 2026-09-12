export const casesPath = "cases";

export const localTypeScriptESLintPath =
	process.env.TYPESCRIPT_ESLINT_PATH ?? undefined;

export const nativePreviewVersion =
	process.env.TYPESCRIPT_NATIVE_VERSION ?? "7.1.0-dev.20260822.1";

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
		values: ["project", "service", "native"],
	},
] as const;

export interface CaseData {
	files: number;
	layout: "even" | "references" | "wide";
	singleRun: boolean;
	types: "native" | "project" | "service";
}

export type CaseEntry = (typeof caseEntries)[number];

export interface NamedCaseData extends CaseData {
	name: string;
}
