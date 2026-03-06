import { Rock } from "@ruiapp/move-style";
import RapidTimePickerMeta from "./RapidTimePickerMeta";
import { genRockRenderer } from "@ruiapp/react-renderer";
import { RapidTimePickerProps, RapidTimePickerRockConfig } from "./rapid-time-picker-types";
import { TimePicker } from "antd";
import { isString } from "lodash";
import moment from "moment";

export function configRapidTimePicker(config: RapidTimePickerRockConfig): RapidTimePickerRockConfig {
  return config;
}

export function RapidTimePicker(props: RapidTimePickerProps) {
  let { value, onChange } = props;

  // Convert string value to moment object
  if (isString(value)) {
    value = moment(moment().format("YYYY-MM-DD") + " " + value);
  }

  function handleChange(time: moment.Moment | null, timeString: string) {
    if (!onChange) {
      return;
    }

    if (!time) {
      onChange(null);
      return;
    }

    const formattedValue = time.format("HH:mm:ss");
    onChange(formattedValue);
  }

  return <TimePicker value={value as moment.Moment} onChange={handleChange} />;
}

export default {
  Renderer: genRockRenderer(RapidTimePickerMeta.$type, RapidTimePicker, true),
  ...RapidTimePickerMeta,
} as Rock<RapidTimePickerRockConfig>;
