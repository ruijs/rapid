import { SequenceDayOfMonthSegmentConfig } from "../SequencePluginTypes";
import { GenerateSequenceNumbersInput } from "../SequenceService";
import { padSegment } from "../segment-utility";
import { IRpdServer } from "~/core/server";

export const segmentType = "dayOfMonth";

export async function resolveSegmentValue(server: IRpdServer, ruleCode: string, config: SequenceDayOfMonthSegmentConfig, input: GenerateSequenceNumbersInput): Promise<string> {
  const segmentValue = new Date().getDate().toString();

  return padSegment(segmentValue, config.length || 2, config.padding || "0");
}
