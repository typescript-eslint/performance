import type { CaseData } from "../data.ts";

import { writeStructure } from "../writing/writeStructure.ts";
import { writeEvenCaseFiles } from "./cases/createEvenCaseFiles.ts";
import { createReferencesCaseFiles } from "./cases/createReferencesCaseFiles.ts";
import { writeWideCaseFiles } from "./cases/createWideCaseFiles.ts";

const caseFileCreators = {
	even: writeEvenCaseFiles,
	references: createReferencesCaseFiles,
	wide: writeWideCaseFiles,
};

export async function writeCaseFiles(data: CaseData, directory: string) {
	return await writeStructure(directory, caseFileCreators[data.layout](data));
}
