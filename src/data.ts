export const casesPath = "cases";

export const caseEntries = [
	{
		label: "files",
		values: [128, 512, 1024],
	},
	{
		label: "layout",
		// values: ["even" /* , "references" , "wide" */],
		values: ["even", "references" /* , "wide" */],
	},
	{
		label: "singleRun",
		values: [/* false, */ true],
	},
	{
		label: "types",
		values: ["project", "service"],
	},
] as const;

export type CaseEntry = (typeof caseEntries)[number];

export type CaseData = {
	[K in CaseEntry["label"]]: ({ label: K } & CaseEntry)["values"][number];
};

export interface NamedCaseData extends CaseData {
	name: string;
}
