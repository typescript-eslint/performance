import { CaseData } from "./data.js";

export function createProjectName(data: CaseData) {
	return Object.entries(data).flat().join("-");
}
