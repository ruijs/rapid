import { RouteContext } from "~/core/routeContext";
import { SequenceMonthSegmentConfig } from "../SequencePluginTypes";
import { GenerateSequenceNumbersInput } from "../SequenceService";
import { padSegment } from "../segment-utility";
import { IRpdServer } from "~/core/server";

export const segmentType = "month";

export async function resolveSegmentValue(
  routeContext: RouteContext,
  server: IRpdServer,
  ruleCode: string,
  config: SequenceMonthSegmentConfig,
  input: GenerateSequenceNumbersInput,
): Promise<string> {
  const segmentValue = (new Date().getMonth() + 1).toString();

  return padSegment(segmentValue, config.length || 2, config.padding || "0");
}
