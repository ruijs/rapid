import { Rock, RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidFormItemMeta from "./RapidFormItemMeta";
import { RapidFormItemRockConfig, RapidFormItemType } from "./rapid-form-item-types";
import RapidExtensionSetting from "../../RapidExtensionSetting";
import { useEffect, useMemo, useRef } from "react";

const formItemTypeToControlRockTypeMap: Record<Exclude<RapidFormItemType, "auto" | "custom">, string> = {
  box: "box",
  text: "antdInput",
  textarea: "antdInputTextArea",
  password: "antdInputPassword",
  number: "antdInputNumber",
  switch: "antdSwitch",
  checkbox: "antdCheckbox",
  checkboxList: "rapidCheckboxListFormInput",
  radioList: "rapidRadioListFormInput",
  date: "rapidDatePicker",
  time: "rapidTimePicker",
  datetime: "rapidDatePicker",
  dateRange: "antdDatePickerRangePicker",
  dateTimeRange: "antdDatePickerRangePicker",
  select: "rapidSelect",
  treeSelect: "rapidTreeSelect",
  tableSelect: "rapidTableSelect",
  entityTableSelect: "sonicEntityTableSelect",
  search: "antdInputSearch",
  file: "rapidUploaderFormInput",
  fileList: "rapidUploaderFormInput",
  image: "rapidUploaderFormInput",
  imageList: "rapidUploaderFormInput",
  json: "rapidJsonFormInput",
  richText: "rapidRichTextEditor",
};

const defaultUploadProps = {
  name: "files",
  action: "/api/upload",
  headers: {},
};

const defaultControlPropsOfFormItemType: Partial<Record<RapidFormItemType, Record<string, any>>> = {
  datetime: {
    showTime: true,
  },

  dateTimeRange: {
    showTime: true,
  },

  search: {
    enterButton: true,
  },

  file: {
    uploadProps: defaultUploadProps,
  },

  fileList: {
    uploadProps: defaultUploadProps,
    multiple: true,
  },

  image: {
    uploadProps: defaultUploadProps,
  },

  imageList: {
    uploadProps: defaultUploadProps,
    multiple: true,
  },
};

const valuePropNameOfFormInput: Record<string, string> = {
  antdSwitch: "checked",
  antdCheckbox: "checked",
  antdUpload: "fileList",
};

export default {
  $type: "rapidFormItem",

  Renderer(context, props: RapidFormItemRockConfig) {
    const isMountedRef = useRef<boolean>(false);

    const mode = props.mode || "input";
    let inputRockType = null;
    let childRock: RockConfig = null;
    if (mode === "input") {
      inputRockType = props.formControlType || formItemTypeToControlRockTypeMap[props.type] || "antdInput";
      const defaultFormControlProps = defaultControlPropsOfFormItemType[props.type];
      childRock = {
        $id: `${props.$id}-input`,
        $type: inputRockType,
        placeholder: props.placeholder,
        ...defaultFormControlProps,
        ...props.formControlProps,
        form: props.form,
      };

      // for antdSelect
      // TODO: may be we should remove `multipleValues` prop from RapidFormItemConfig
      if (props.multipleValues) {
        childRock.mode = "multiple";
      }
    } else {
      let rendererType = props.rendererType;
      if (!rendererType) {
        rendererType = RapidExtensionSetting.getDefaultRendererTypeOfFieldType(props.valueFieldType);
        if (props.valueFieldType === "relation[]") {
          rendererType = "rapidArrayRenderer";
        }
      }
      const defaultRendererProps = RapidExtensionSetting.getDefaultRendererProps(props.valueFieldType, rendererType);

      childRock = {
        $id: `${props.$id}-display`,
        $type: rendererType,
        ...defaultRendererProps,
        ...props.rendererProps,
        form: props.form,
      };
    }

    const dependencies = (props.storeDependencies || []).map((key) => props.form.getFieldValue(key));
    useEffect(() => {
      if (isMountedRef.current) {
        context.page.sendComponentMessage(`${props.$id}-input`, {
          name: "reload",
        });
      }

      isMountedRef.current = true;
    }, dependencies);

    const rockConfig: RockConfig = {
      $id: props.$id,
      $type: "antdFormItem",
      required: props.required,
      name: (props.valueFieldName || props.code)?.split("."), // TODO: should `code` be required for a search form item?
      label: props.label,
      hidden: props.hidden,
      valuePropName: (inputRockType && valuePropNameOfFormInput[inputRockType]) || "value",
      form: props.form,
      children: childRock,
      rules: props.rules,
      extra: props.extra,
      labelAlign: props.labelAlign,
      labelCol: props.labelCol,
      wrapperCol: props.wrapperCol,
      $exps: props.$exps,
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidFormItemMeta,
} as Rock;
