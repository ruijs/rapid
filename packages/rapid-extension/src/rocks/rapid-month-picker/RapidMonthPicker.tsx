import { Rock, RockConfig } from "@ruiapp/move-style";
import RapidToolbarLinkMeta from "./RapidMonthPickerMeta";
import { renderRock } from "@ruiapp/react-renderer";
import { RapidMonthPickerRockConfig } from "./rapid-month-picker-types";
import { isString } from "lodash";
import moment from "moment";

export default {
  $type: "rapidMonthPicker",

  Renderer(context, props) {
    if (isString(props.value)) {
      props.value = moment(props.value);
    }

    function onMonthDatePickerChange(value: any) {
      const formatedValue = value.format("YYYY-MM");
      return props.onChange && props.onChange(formatedValue);
    }

    const rockConfig: RockConfig = {
      ...props,
      $id: `${props.$id}-inner`,
      $type: "antdDatePicker",
      picker: "month",
      onChange: onMonthDatePickerChange,
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidToolbarLinkMeta,
} as Rock<RapidMonthPickerRockConfig>;
