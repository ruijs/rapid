import { SequenceYearSegmentConfig } from "../SequencePluginTypes";
import { GenerateSequenceNumbersInput } from "../SequenceService";
import { padSegment } from "../segment-utility";
import { IRpdServer } from "~/core/server";

export const segmentType = "year";

export async function resolveSegmentValue(
  server: IRpdServer,
  ruleCode: string,
  config: SequenceYearSegmentConfig,
  input: GenerateSequenceNumbersInput,
): Promise<string> {
  const segmentValue = new Date().getFullYear().toString();

  return padSegment(segmentValue, config.length || 4, config.padding || "0");
}
