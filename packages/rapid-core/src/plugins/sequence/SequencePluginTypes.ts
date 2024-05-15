export type PropertySequenceConfig = {
  enabled: boolean;
  config: SequenceRuleConfig;
}

export type SequenceRuleConfig = {
  segments: SequenceSegmentConfig[];
}


export type SequenceSegmentConfig =
  | SequenceLiteralSegmentConfig
  | SequenceYearSegmentConfig
  | SequenceMonthSegmentConfig
  | SequenceDayOfMonthSegmentConfig
  | SequenceDayOfWeekSegmentConfig
  | SequenceDayOfYearSegmentConfig
  | SequenceParameterSegmentConfig
  | SequenceAutoIncrementSegmentConfig
  ;

export type SequenceLiteralSegmentConfig = {
  type: "literal",
  content: string;
}

export type SequenceYearSegmentConfig = {
  type: "year",
  padding?: string;
  length?: number;
}

export type SequenceMonthSegmentConfig = {
  type: "month",
  padding?: string;
  length?: number;
}

export type SequenceDayOfMonthSegmentConfig = {
  type: "dayOfMonth",
  padding?: string;
  length?: number;
}

export type SequenceDayOfWeekSegmentConfig = {
  type: "dayOfWeek",
  padding?: string;
  length?: number;
}

export type SequenceDayOfYearSegmentConfig = {
  type: "dayOfYear",
  padding?: string;
  length?: number;
}

export type SequenceParameterSegmentConfig = {
  type: "parameter",
  parameterName: string;
  padding?: string;
  length?: number;
}

export type SequenceAutoIncrementSegmentConfig = {
  type: "autoIncrement",
  scope?: string;
  period?: "forever" | "day" | "month" | "year";
  padding?: string;
  length?: number;
}
