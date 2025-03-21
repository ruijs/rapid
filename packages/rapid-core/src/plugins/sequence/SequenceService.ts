import { IRpdServer } from "~/core/server";
import segmentResolvers from "./segments";
import { find } from "lodash";
import { SequenceRuleConfig, SequenceSegmentConfig } from "./SequencePluginTypes";
import { RouteContext } from "~/core/routeContext";

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
  resolveSegmentValue(
    routeContext: RouteContext,
    server: IRpdServer,
    ruleCode: string,
    config: SequenceSegmentConfig,
    input: GenerateSequenceNumbersInput,
  ): Promise<string>;
}

export default class SequenceService {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async generateSn(routeContext: RouteContext | null, server: IRpdServer, input: GenerateSequenceNumbersInput): Promise<string[]> {
    const sequenceNumbers = [];
    const { ruleCode, parameters } = input;
    let { amount } = input;

    if (!amount) {
      amount = 1;
    }

    const sequenceRuleDataAccessor = server.getDataAccessor({
      singularCode: "sequence_rule",
    });

    const sequenceRule = await sequenceRuleDataAccessor.findOne(
      {
        filters: [
          {
            operator: "eq",
            field: {
              name: "code",
            },
            value: ruleCode,
          },
        ],
      },
      routeContext?.getDbTransactionClient(),
    );

    if (!sequenceRule) {
      throw new Error(`Failed to generate sequence number. Sequence with code '${sequenceRule.code}' not found.`);
    }

    const sequenceConfig: SequenceRuleConfig = sequenceRule.config;
    if (!sequenceConfig || !sequenceConfig.segments) {
      throw new Error("Failed to generate sequence number. Sequence not configured.");
    }

    for (let i = 0; i < amount; i++) {
      let sequenceNumber: string = "";

      for (const segmentConfig of sequenceConfig.segments) {
        const segmentResolver: SegmentResolver = find(segmentResolvers, (item) => item.segmentType === segmentConfig.type);
        if (!segmentResolver) {
          // TODO: deal with unknown segment type
          server.getLogger().warn(`Unknown segment type "${segmentConfig.type}"`);
          continue;
        }

        const segment = await segmentResolver.resolveSegmentValue(routeContext, server, ruleCode, segmentConfig, input);
        sequenceNumber += segment;
      }

      sequenceNumbers.push(sequenceNumber);
    }

    return sequenceNumbers;
  }
}
