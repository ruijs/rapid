import { GenerateSequenceNumbersInput } from "../SequenceService";
import { padSegment } from "../segment-utility";
import { IRpdServer } from "~/core/server";
import { get } from "lodash";
import dayjs from "dayjs";
import { SequenceAutoIncrementSegmentConfig } from "../SequencePluginTypes";
import { RouteContext } from "~/core/routeContext";

export const segmentType = "autoIncrement";

export async function resolveSegmentValue(
  routeContext: RouteContext,
  server: IRpdServer,
  ruleCode: string,
  config: SequenceAutoIncrementSegmentConfig,
  input: GenerateSequenceNumbersInput,
): Promise<string> {
  const autoIncrementRecordDataAccessor = server.getDataAccessor({
    singularCode: "sequence_auto_increment_record",
  });

  const scope = get(input.parameters, config.scope, "");

  const autoIncrementRecord = await autoIncrementRecordDataAccessor.findOne(
    {
      filters: [
        {
          operator: "eq",
          field: "rule_code",
          value: ruleCode,
        },
        {
          operator: "eq",
          field: "scope",
          value: scope,
        },
      ],
    },
    routeContext?.getDbTransactionClient(),
  );

  let now = dayjs();
  let nowString = now.format("YYYY-MM-DD HH:mm:ss.SSS Z");

  let nextValue = 1;
  if (autoIncrementRecord) {
    let shouldReset = false;
    const period = config.period || "forever";
    const lastUpdate = dayjs(autoIncrementRecord.updated_at);
    if (period === "year") {
      if (now.year() > lastUpdate.year()) {
        shouldReset = true;
      }
    } else if (period === "month") {
      if (now.year() !== lastUpdate.year() || now.month() !== lastUpdate.month()) {
        shouldReset = true;
      }
    } else if (period === "day") {
      if (now.year() !== lastUpdate.year() || now.month() !== lastUpdate.month() || now.date() !== lastUpdate.date()) {
        shouldReset = true;
      }
    }

    if (!shouldReset) {
      nextValue = autoIncrementRecord.current_value + 1;
    }
    await autoIncrementRecordDataAccessor.updateById(
      autoIncrementRecord.id,
      {
        current_value: nextValue,
        updated_at: nowString,
      },
      routeContext?.getDbTransactionClient(),
    );
  } else {
    await autoIncrementRecordDataAccessor.create(
      {
        rule_code: ruleCode,
        scope: scope,
        current_value: nextValue,
        updated_at: nowString,
      },
      routeContext?.getDbTransactionClient(),
    );
  }

  const segmentValue = nextValue.toString();

  return padSegment(segmentValue, config.length, config.padding || "0");
}
