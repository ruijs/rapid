import { Rock, RockConfig } from "@ruiapp/move-style";
import RapidToolbarLinkMeta from "./RapidTimePickerMeta";
import { renderRock } from "@ruiapp/react-renderer";
import { RapidTimePickerRockConfig } from "./rapid-time-picker-types";
import { isString } from "lodash";
import moment from "moment";

export default {
  $type: "rapidTimePicker",

  Renderer(context, props) {
    if (isString(props.value)) {
      props.value = moment(moment().format("YYYY-MM-DD") + " " + props.value);
    }

    const rockConfig: RockConfig = {
      ...props,
      $id: `${props.$id}-inner`,
      $type: "antdDatePickerTimePicker",
      onChange: function (value) {
        if (value.format) {
          value = value.format("HH:mm:ss");
        }

        props.onChange?.(value);
      },
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidToolbarLinkMeta,
} as Rock<RapidTimePickerRockConfig>;
