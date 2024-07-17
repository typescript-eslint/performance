import { CaseData } from "../data.js";
import { writeStructure } from "../writing/writeStructure.js";
import { writeEvenCaseFiles } from "./cases/createEvenCaseFiles.js";
import { createReferencesCaseFiles } from "./cases/createReferencesCaseFiles.js";
import { writeWideCaseFiles } from "./cases/createWideCaseFiles.js";

const caseFileCreators = {
	even: writeEvenCaseFiles,
	references: createReferencesCaseFiles,
	wide: writeWideCaseFiles,
};

export async function writeCaseFiles(data: CaseData, directory: string) {
	return await writeStructure(directory, caseFileCreators[data.layout](data));
}
