import { Rock, RockConfig, RockConfigBase, RockEvent, RockEventHandlerScript, handleComponentEvent } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidFormMeta from "./RapidFormMeta";
import type { RapidFormRockConfig, RapidFormState } from "./rapid-form-types";
import { assign, each, forEach, get, mapValues, merge, pick, set, trim } from "lodash";
import { Form } from "antd";
import { useEffect, useMemo, useState } from "react";
import { parseRockExpressionFunc } from "../../utils/parse-utility";
import { generateRockConfigOfError } from "../../rock-generators/generateRockConfigOfError";
import { RapidFormSubmitOptions } from "../../types/rapid-action-types";
import { getExtensionLocaleStringResource } from "../../helpers/i18nHelper";

export default {
  $type: "rapidForm",

  onResolveState(props, state) {
    const [form] = Form.useForm();
    return {
      form,
    };
  },

  async onReceiveMessage(message, state, props, rockInstance) {
    // TODO: refactor to write less if-else
    if (message.name === "submit") {
      const form = state.form;
      try {
        const values = await form.validateFields();
        form.submit();
      } catch (err) {
        message.framework.getRockLogger().error(props, `Failed to submit form: ${err.message}`, { error: err });
      }
    } else if (message.name === "validateFields") {
      state.form.validateFields();
    } else if (message.name === "setFieldsValue") {
      state.form.setFieldsValue(message.payload);
    } else if (message.name === "resetFields") {
      state.form.resetFields();
      handleComponentEvent("onFormRefresh", message.framework, message.page as any, rockInstance._scope, props, props.onFormRefresh, [{ form: state.form }]);
    } else if (message.name === "refreshView") {
      state.form.resetFields();
      handleComponentEvent("onFormRefresh", message.framework, message.page as any, rockInstance._scope, props, props.onFormRefresh, [{ form: state.form }]);
    } else if (message.name === "setSubmitOptions") {
      state.submitOptions = message.payload;
    }
  },

  Renderer(context, props, state) {
    const { framework, page, scope, logger } = context;

    // 当前主要是触发 rerender
    const [currentFormData, setCurrentFormData] = useState<Record<string, any>>({});

    if (!props.items) {
      return renderRock({
        context,
        rockConfig: generateRockConfigOfError(new Error(`RapidFormConfig.items are required.`)),
      });
    }

    if (props.onFinish && props.onFormSubmit) {
      return renderRock({
        context,
        rockConfig: generateRockConfigOfError(new Error(`"onFinish" should not be configured while "onFormSubmit" is configured.`)),
      });
    }

    const dataFormItemRocks: RockConfig[] = [];
    if (props.items) {
      props.items.forEach((formItemConfig) => {
        (formItemConfig as any).form = state.form;

        let formItemRockConfig: RockConfig;
        if (formItemConfig.hidden) {
          formItemRockConfig = {
            $id: `${props.$id}-item-${formItemConfig.uniqueKey || formItemConfig.code}`,
            $type: "rapidFormItem",
            ...formItemConfig,
          };
        } else {
          formItemRockConfig = {
            $id: `${props.$id}-item-${formItemConfig.uniqueKey || formItemConfig.code}-col`,
            $type: "antdCol",
            span: (24 / (props.column || 1)) * (formItemConfig.column || 1),
            form: state.form,
            children: {
              $id: `${props.$id}-item-${formItemConfig.uniqueKey || formItemConfig.code}`,
              $type: "rapidFormItem",
              ...formItemConfig,
            },
            $exps: formItemConfig.$exps,
          };
        }

        dataFormItemRocks.push(formItemRockConfig);
      });
    }

    const formActionRocks: RockConfig[] = [];
    each(props.actions, (formAction, index) => {
      if ((formAction as RockConfig).$type) {
        formActionRocks.push(formAction as RockConfig);
        return;
      }

      page.interpreteComponentProperties(null, formAction as any, {});

      const formActionRock: RockConfig = {
        $id: `${props.$id}-actions-${index}`,
        $type: "antdButton",
        children: {
          $type: "text",
          text: formAction.actionText,
        },
        onClick: () => {
          if (formAction.submitMethod || formAction.submitUrl || formAction.fixedFields) {
            page.sendComponentMessage(props.$id, {
              name: "setSubmitOptions",
              payload: {
                submitMethod: formAction.submitMethod,
                submitUrl: formAction.submitUrl,
                fixedFields: formAction.fixedFields,
                successMessage: formAction.successMessage,
                errorMessage: formAction.errorMessage,
                onSuccess: formAction.onSuccess,
                onError: formAction.onError,
              } satisfies RapidFormSubmitOptions,
            });
          }
        },
        _hidden: formAction.hidden,
      };
      if (formAction.actionType === "submit") {
        formActionRock.type = formAction.buttonType || "primary";
        formActionRock.htmlType = "submit";
        formActionRock.form = undefined;
      }
      assign(formActionRock, formAction.actionProps);
      formActionRocks.push(formActionRock);
    });

    const isHorizonLayout = !(props.layout === "vertical" || props.layout === "inline");

    const formActionsRowConfig: RockConfig = {
      $id: `${props.$id}-actions`,
      $type: "antdRow",
      gutter: 24,
      children: [
        {
          $id: `${props.$id}-actions-wrap-col`,
          $type: "antdCol",
          span: 24,
          children: [
            {
              $id: `${props.$id}-actions-wrap-form-item`,
              $type: "antdFormItem",
              style: {
                textAlign: props.actionsAlign || (isHorizonLayout ? "center" : "left"),
              },
              ...props.actionsLayout,
              children:
                formActionRocks.length == 1
                  ? formActionRocks
                  : {
                      $type: "antdSpace",
                      size: 16,
                      children: formActionRocks,
                    },
            },
          ],
        },
      ],
    };

    const dataSource = props.dataSource || (props.dataSourceCode && get(scope.stores[props.dataSourceCode], "data.list[0]"));
    const initialValues = useMemo(() => {
      let values;
      if (dataSource || (props.dataSourceCode && !props.disabledLoadStore)) {
        values = {
          ...props.defaultFormFields,
          ...(props.fieldNameOfFormDataInDataSource ? get(dataSource, props.fieldNameOfFormDataInDataSource) : dataSource),
        };
      } else {
        values = props.defaultFormFields;
      }

      if (typeof props.formDataAdapter === "string" && trim(props.formDataAdapter)) {
        const formDataAdapter = parseRockExpressionFunc(props.formDataAdapter, { data: values, form: state.form }, context);
        values = formDataAdapter();
      }

      return values || {};
    }, [props.defaultFormFields, props.disabledLoadStore, props.fieldNameOfFormDataInDataSource, dataSource]);

    useEffect(() => {
      state.form.setFieldsValue(initialValues);
      setCurrentFormData(initialValues);
    }, [initialValues, state.form]);

    const onValuesChange: RockEventHandlerScript["script"] = (event: RockEvent) => {
      setCurrentFormData(event.args[0]);
      handleComponentEvent("onValuesChange", framework, page, scope, props, props.onValuesChange, event.args);
    };

    const formRockConfig: RockConfig = {
      $id: `${props.$id}-antdForm`,
      $type: "antdForm",
      form: state.form,
      labelCol: isHorizonLayout ? props.labelCol || { span: 8 } : null,
      wrapperCol: isHorizonLayout ? props.wrapperCol || { span: 16 } : null,
      layout: props.layout,
      requiredMark: props.requiredMark,
      initialValues,
      children: [
        {
          $id: `${props.$id}-antdForm-items-row`,
          $type: "antdRow",
          gutter: 24,
          children: dataFormItemRocks,
        },
        ...(formActionRocks.length ? [formActionsRowConfig] : []),
      ],
      onFinish: [
        {
          $action: "script",
          script: async (event: RockEvent) => {
            const submitOptions = state.submitOptions;
            const submitUrl = submitOptions?.submitUrl || props.submitUrl;
            let onSubmit = props.onSubmit || props.onFormSubmit || props.onFinish;
            if (!submitUrl && !onSubmit) {
              logger.error(props, `Failed to submit form: submitUrl or onSubmit is not configured.`);
              return;
            }

            let formData = Object.assign({}, omitUndefinedValues(event.args[0]));

            const fixedFields = omitUndefinedValues(merge({}, props.fixedFields, submitOptions?.fixedFields));

            if (typeof props.beforeSubmitFormDataAdapter === "string" && trim(props.beforeSubmitFormDataAdapter)) {
              const adapter = parseRockExpressionFunc(props.beforeSubmitFormDataAdapter, { formData, fixedFields }, context);
              formData = adapter();
            }

            let submitData: any;
            if (props.fieldNameOfFormDataInSubmitData) {
              submitData = set({}, props.fieldNameOfFormDataInSubmitData, formData);
            } else {
              submitData = formData;
            }
            submitData = merge(submitData, fixedFields);

            if (props.beforeSubmit) {
              await handleComponentEvent("beforeSubmit", event.framework, event.page as any, event.scope, event.sender, props.beforeSubmit, [
                submitData,
                submitOptions,
              ]);
            }

            if (!onSubmit) {
              const submitMethod = submitOptions?.submitMethod || props.submitMethod || "POST";
              const successMessage = submitOptions?.successMessage || props.successMessage || getExtensionLocaleStringResource(framework, "saveSuccess");
              const errorMessage = submitOptions?.errorMessage || props.errorMessage || getExtensionLocaleStringResource(framework, "saveError");

              const onSubmitSuccess = submitOptions?.onSuccess || props.onSubmitSuccess;
              const onSubmitError = submitOptions?.onError || props.onSubmitError;

              onSubmit = {
                $action: "sendHttpRequest",
                method: submitMethod,
                url: submitUrl,
                data: submitData,
                onSuccess: [
                  {
                    $action: "antdToast",
                    type: "success",
                    content: successMessage,
                  },
                  ...(onSubmitSuccess ? (Array.isArray(onSubmitSuccess) ? onSubmitSuccess : [onSubmitSuccess]) : []),
                ],
                onError: [
                  {
                    $action: "antdToast",
                    type: "error",
                    $exps: {
                      content: `${JSON.stringify(errorMessage)}+ " " + $event.args[0].message`,
                    },
                  },
                  ...(onSubmitError ? (Array.isArray(onSubmitError) ? onSubmitError : [onSubmitError]) : []),
                ],
              };
            }

            await handleComponentEvent("onSubmit", event.framework, event.page as any, event.scope, event.sender, onSubmit, [submitData, submitOptions]);
          },
        },
      ],
      onValuesChange: {
        $action: "script",
        script: onValuesChange,
      },
    };

    let formSectionConfig: RockConfig;
    if (props.dataSourceCode) {
      formSectionConfig = {
        $id: `${props.$id}-show`,
        $type: "show",
        fallback: [
          {
            $id: `${props.$id}-spin`,
            $type: "antdSpin",
          },
        ],
        children: [formRockConfig],
        $exps: {
          when: `$scope.stores.${props.dataSourceCode}.data`,
        },
      };
    } else {
      formSectionConfig = formRockConfig;
    }

    const rockConfig: RockConfig = formSectionConfig;
    return renderRock({ context, rockConfig });
  },

  ...RapidFormMeta,
} as Rock<RapidFormRockConfig, RapidFormState>;

function omitUndefinedValues(data: Record<string, any>) {
  return mapValues(data, (v) => (v === undefined ? null : v));
}
