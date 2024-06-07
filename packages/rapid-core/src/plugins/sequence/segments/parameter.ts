import { SequenceParameterSegmentConfig } from "../SequencePluginTypes";
import { GenerateSequenceNumbersInput } from "../SequenceService";
import { padSegment } from "../segment-utility";
import { get } from "lodash";
import { IRpdServer } from "~/core/server";

export const segmentType = "parameter";

export async function resolveSegmentValue(server: IRpdServer, ruleCode: string, config: SequenceParameterSegmentConfig, input: GenerateSequenceNumbersInput): Promise<string> {
  const segmentValue = get(input.parameters, config.parameterName, config.defaultContent || "");

  return padSegment(segmentValue, config.length, config.padding);
}
