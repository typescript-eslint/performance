import type { CaseData } from "./data.ts";

export function createProjectName(data: CaseData) {
	return Object.entries(data).flat().join("-").toLowerCase();
}
