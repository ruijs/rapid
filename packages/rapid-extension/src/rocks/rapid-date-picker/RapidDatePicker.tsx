import { Rock, RockConfig } from "@ruiapp/move-style";
import RapidToolbarLinkMeta from "./RapidDatePickerMeta";
import { renderRock } from "@ruiapp/react-renderer";
import { RapidDatePickerRockConfig } from "./rapid-date-picker-types";
import { isString } from "lodash";
import moment from "moment";

export default {
  $type: "rapidDatePicker",

  Renderer(context, props) {
    if (isString(props.value)) {
      props.value = moment(props.value);
    }

    function onDatePickerChange(value: any) {
      const today = value.format("YYYY-MM-DD");
      props.onChange && props.onChange(today);
    }

    const rockConfig: RockConfig = {
      ...props,
      $id: `${props.$id}-inner`,
      $type: "antdDatePicker",
      onChange: onDatePickerChange,
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidToolbarLinkMeta,
} as Rock<RapidDatePickerRockConfig>;
