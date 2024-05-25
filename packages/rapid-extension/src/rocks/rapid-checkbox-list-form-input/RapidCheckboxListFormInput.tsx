import { MoveStyleUtils, Rock } from "@ruiapp/move-style";
import { Checkbox } from "antd";
import { RapidCheckboxListFormInputRockConfig } from "./rapid-checkbox-list-form-input-types";
import RapidCheckboxListFormInputMeta from "./RapidCheckboxListFormInputMeta";
import { filter, get, isObject, map } from "lodash";
import type { CheckboxGroupProps, CheckboxOptionType } from "antd/lib/checkbox";
import { Fragment, useCallback } from "react";

export default {
  $type: "rapidCheckboxListFormInput",

  Renderer(context, props: RapidCheckboxListFormInputRockConfig) {
    const { scope } = context;

    const { groupsDataSource, groupsDataSourceCode, listDataSource, listDataSourceCode, groupByFieldName, listTextFormat } = props;

    let groupList = groupsDataSource?.data?.list;
    if (groupsDataSourceCode) {
      groupList = scope.stores[groupsDataSourceCode]?.data?.list;
    }

    let itemList = listDataSource?.data?.list;
    if (listDataSourceCode) {
      itemList = scope.stores[listDataSourceCode]?.data?.list
    }

    const listTextFieldName = props.listTextFieldName || "name";
    const listValueFieldName = props.listValueFieldName || "id";

    const groupTextFieldName = props.groupTextFieldName || "name";
    const groupValueFieldName = props.groupValueFieldName || "id";

    function getCheckboxOption(item: any): CheckboxOptionType {
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
      }
    }

    let selectedValue: string[];
    if (props.valueFieldName) {
      selectedValue = map(props.value, item => {
        if (isObject(item)) {
          return get(item, props.valueFieldName)
        }
        return item;
      });
    } else {
      selectedValue = props.value;
    }

    const antdProps: CheckboxGroupProps = {
      disabled: props.disabled,
      value: selectedValue,
      onChange: props.onChange,
      style: { width: "100%" },
    };

    const renderCheckboxList = useCallback(() => {
      if (groupByFieldName) {
        return (groupList || []).map((group, index) => {
          const groupValue = get(group, groupValueFieldName) || index;
          const itemsInGroup = filter(itemList, (item) => get(item, groupByFieldName) === groupValue);

          return <Fragment key={groupValue}>
            <h4 className="ant-list-item-meta-title">
              {
                get(group, groupTextFieldName, "")
              }
            </h4>
            {
              itemsInGroup.map((item, index) => {
                const option = getCheckboxOption(item);
                return <Checkbox key={index} value={option.value}>{option.label}</Checkbox>
              })
            }
          </Fragment>
        });
      } else {
        return itemList.map((item, index) => {
          const option = getCheckboxOption(item);
          return <Checkbox key={index} value={option.value}>{option.label}</Checkbox>
        })
      }
    }, [groupList, itemList, groupByFieldName]);

    return <Checkbox.Group {...antdProps}>
      {
        renderCheckboxList()
      }
    </Checkbox.Group>
  },

  ...RapidCheckboxListFormInputMeta,
} as Rock;