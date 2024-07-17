export const casesPath = "cases";

export const caseEntries = [
	{
		label: "files",
		// values: [1, 32, 64, 128, 256, 512, 1024],
		values: [512, 1024],
	},
	{
		label: "layout",
		values: ["even" /* , "projects" , "wide" */],
	},
	{
		label: "singleRun",
		values: [false, true],
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

export type CaseTypes = CaseData["types"];

export interface NamedCaseData extends CaseData {
	name: string;
}
