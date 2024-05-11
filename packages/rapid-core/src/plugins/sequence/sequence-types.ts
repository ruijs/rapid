import { SequenceSegmentConfig } from "~/types";

export type PropertySequenceConfig = {
  autoGenerate: boolean;
  ruleConfig: SequenceRuleConfig;
}

export type SequenceRuleConfig = {
  segments: SequenceSegmentConfig[];
}