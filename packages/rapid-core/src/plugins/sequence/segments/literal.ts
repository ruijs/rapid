import { SequenceLiteralSegmentConfig } from "../SequencePluginTypes";
import { GenerateSequenceNumbersInput } from "../SequenceService";
import { IRpdServer } from "~/core/server";

export const segmentType = "literal";

export async function resolveSegmentValue(server: IRpdServer, ruleCode: string, config: SequenceLiteralSegmentConfig, input: GenerateSequenceNumbersInput): Promise<string> {
  return config.content || "";
}
