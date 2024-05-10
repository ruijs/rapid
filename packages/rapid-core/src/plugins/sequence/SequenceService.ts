import { IRpdServer } from "~/core/server";
import { SequenceSegmentConfig } from "~/types";
import segmentResolvers from "./segments";
import { find } from "lodash";

export interface GenerateSequenceNumbersInput {
  ruleCode: string;
  parameters: Record<string, string>;
  amount: number;
}

export interface GenerateSequenceNumbersOutput {
  sequences: string[];
}

export interface SegmentResolver {
  segmentType: string;
  resolveSegmentValue(server: IRpdServer, ruleCode: string, config: SequenceSegmentConfig, input: GenerateSequenceNumbersInput): Promise<string>;
}

export async function generateSn(server: IRpdServer, input: GenerateSequenceNumbersInput): Promise<string[]> {
  const sequenceNumbers = [];
  const { ruleCode, parameters } = input;
  let { amount } = input;

  if (!amount) {
    amount = 1;
  }

  const sequenceRuleDataAccessor = server.getDataAccessor({
    singularCode: "sequence_rule",
  });

  const sequenceRule = await sequenceRuleDataAccessor.findOne({
    filters: [
      {
        operator: "eq",
        field: "code",
        value: ruleCode,
      }
    ]
  });

  if (!sequenceRule) {
    throw new Error(`Failed to generate sequence number. Sequence with code '${sequenceRule.code}' not found.`);
  }

  const sequenceConfig = sequenceRule.config;
  if (!sequenceConfig || !sequenceConfig.segments) {
    throw new Error("Failed to generate sequence number. Sequence not configured.");
  }

  for (let i = 0; i < amount; i++) {
    let sequenceNumber: string = "";

    for (const segmentConfig of sequenceConfig.segments) {
      const segmentResolver = find(segmentResolvers, (item) => item.segmentType === segmentConfig.type);
      if (!segmentResolver) {
        // unkown segment type
        continue;
      }

      const segment = await segmentResolver.resolveSegmentValue(server, ruleCode, segmentConfig, input);
      sequenceNumber += segment;
    }

    sequenceNumbers.push(sequenceNumber);
  }

  return sequenceNumbers;
}
