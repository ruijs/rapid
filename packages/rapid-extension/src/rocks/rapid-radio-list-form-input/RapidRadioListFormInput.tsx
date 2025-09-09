import { MoveStyleUtils, Rock } from "@ruiapp/move-style";
import { Radio, Space } from "antd";
import { RapidRadioListFormInputRockConfig } from "./rapid-radio-list-form-input-types";
import RapidCheckboxListFormInputMeta from "./RapidRadioListFormInputMeta";
import { get, isObject, map } from "lodash";
import type { RadioGroupProps } from "antd/lib/radio";
import { useMemo } from "react";

export default {
  $type: "rapidRadioListFormInput",

  Renderer(context, props: RapidRadioListFormInputRockConfig) {
    const { scope } = context;

    const { listTextFormat } = props;

    let listItems = [];
    if (props.listDataSourceCode) {
      listItems = scope.stores[props.listDataSourceCode]?.data?.list;
    } else {
      listItems = props.listItems || props.listDataSource?.data?.list;
    }

    const listTextFieldName = props.listTextFieldName || "name";
    const listValueFieldName = props.listValueFieldName || "id";

    function getCheckboxOption(item: any): { label: string; value: string } {
      let label: string;
      if (listTextFormat) {
        label = MoveStyleUtils.fulfillVariablesInString(listTextFormat, item);
      } else {
        label = get(item, listTextFieldName);
      }
      const value = get(item, listValueFieldName);

      return {
        label,
        value,
      };
    }

    let selectedValue: string[];
    if (props.valueFieldName) {
      selectedValue = map(props.value, (item) => {
        if (isObject(item)) {
          return get(item, props.valueFieldName);
        }
        return item;
      });
    } else {
      selectedValue = props.value;
    }

    const antdProps: RadioGroupProps = {
      disabled: props.disabled,
      value: selectedValue,
      onChange: props.onChange,
      style: { width: "100%" },
    };

    const radioList = useMemo(() => {
      return (
        <Space direction={props.direction || "horizontal"}>
          {listItems.map((item, index) => {
            const option = getCheckboxOption(item);
            return (
              <Radio key={index} value={option.value}>
                {option.label}
              </Radio>
            );
          })}
        </Space>
      );
    }, [listItems]);

    return <Radio.Group {...antdProps}>{radioList}</Radio.Group>;
  },

  ...RapidCheckboxListFormInputMeta,
} as Rock;
