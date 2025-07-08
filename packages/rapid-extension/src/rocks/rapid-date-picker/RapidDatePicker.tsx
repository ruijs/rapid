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
      if (props.picker) {
        let formatedValue: any;
        switch (props.picker) {
          case "year":
            formatedValue = value.format("YYYY");
            break;
          case "month":
            formatedValue = value.format("YYYY-MM");
            break;
          default:
            formatedValue = value.format("YYYY-MM-DD");
            break;
        }
        return props.onChange && props.onChange(formatedValue);
      }
    }

    const rockConfig: RockConfig = {
      ...props,
      $id: `${props.$id}-inner`,
      $type: "antdDatePicker",
      onChange: props.showTime ? props.onChange : onDatePickerChange,
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidToolbarLinkMeta,
} as Rock<RapidDatePickerRockConfig>;
