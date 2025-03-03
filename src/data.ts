export const casesPath = "cases";

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
