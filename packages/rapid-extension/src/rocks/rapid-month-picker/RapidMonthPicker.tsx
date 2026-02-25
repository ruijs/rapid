import { Rock } from "@ruiapp/move-style";
import RapidMonthPickerMeta from "./RapidMonthPickerMeta";
import { genRockRenderer } from "@ruiapp/react-renderer";
import { RapidMonthPickerProps, RapidMonthPickerRockConfig } from "./rapid-month-picker-types";
import { DatePicker } from "antd";
import { isString } from "lodash";
import moment from "moment";

export function configRapidMonthPicker(config: RapidMonthPickerRockConfig): RapidMonthPickerRockConfig {
  return config;
}

export function RapidMonthPicker(props: RapidMonthPickerProps) {
  let { value, onChange } = props;

  // Convert string value to moment object
  if (isString(value)) {
    value = moment(value);
  }

  function handleChange(date: moment.Moment | null, dateString: string) {
    if (!onChange) {
      return;
    }

    if (!date) {
      onChange(null);
      return;
    }

    const formattedValue = date.format("YYYY-MM");
    onChange(formattedValue);
  }

  return <DatePicker value={value as moment.Moment} onChange={handleChange} picker="month" />;
}

export default {
  Renderer: genRockRenderer(RapidMonthPickerMeta.$type, RapidMonthPicker),
  ...RapidMonthPickerMeta,
} as Rock<RapidMonthPickerRockConfig>;
