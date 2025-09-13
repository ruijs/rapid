import { Framework, MoveStyleUtils, Page, PageConfig, RuiEvent } from "@ruiapp/move-style";
import { Rui } from "@ruiapp/react-renderer";
import { Rui as RuiRock, ErrorBoundary, Show, HtmlElement, Anchor, Box, Label, List, Scope, Text } from "@ruiapp/react-rocks";
import AntdExtension from "@ruiapp/antd-extension";
import MonacoExtension from "@ruiapp/monaco-extension";
import RapidExtension, { rapidAppDefinition, RapidEntityFormConfig, RapidExtensionSetting, RapidFormRockConfig, RapidPage } from "@ruiapp/rapid-extension";
import _ from "lodash";
import qs from "qs";
import { message } from "antd";
import { RuiLoggerProvider } from "../rui-logger";
import EntityModels from "../_definitions/meta/entity-models";
import DataDictionaryModels from "../_definitions/meta/data-dictionary-models";
import { useMemo } from "react";

import antdStyles from "antd/dist/antd.css";
import appStyles from "~/styles/app.css";

export function links() {
  return [antdStyles, appStyles].map((styles) => {
    return { rel: "stylesheet", href: styles };
  });
}

const framework = new Framework();
framework.setLoggerProvider(new RuiLoggerProvider());

framework.registerExpressionVar("_", _);
framework.registerExpressionVar("qs", qs);

framework.registerComponent(RuiRock);
framework.registerComponent(ErrorBoundary);
framework.registerComponent(Show);
framework.registerComponent(HtmlElement);
framework.registerComponent(Scope);
framework.registerComponent(Text);

framework.registerComponent(Anchor);
framework.registerComponent(Box);
framework.registerComponent(Label);
framework.registerComponent(List);

framework.loadExtension(AntdExtension);
framework.loadExtension(MonacoExtension);
framework.loadExtension(RapidExtension);

RapidExtensionSetting.setDefaultRendererPropsOfRendererType("rapidCurrencyRenderer", {
  usingThousandSeparator: true,
  decimalPlaces: 2,
  currencyCode: "CNY",
});

rapidAppDefinition.setAppDefinition({
  entities: EntityModels,
  dataDictionaries: DataDictionaryModels,
});

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "title",
    },
    {
      type: "textarea",
      code: "description",
    },
    {
      type: "auto",
      code: "done",
    },
  ],
};

const rapidPage: RapidPage = {
  code: "pm_task_list",
  name: "任务列表",
  title: "任务管理",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "box",
      style: {
        width: "300px",
        margin: "200px auto 0",
      },
      children: [
        {
          $type: "rapidForm",
          layout: "vertical",
          items: [
            {
              type: "text",
              code: "account",
              label: "用户名",
              required: true,
              rules: [
                // eslint-disable-next-line no-template-curly-in-string
                { required: true, message: "请输入${label}" },
              ],
            },
            {
              type: "password",
              code: "password",
              label: "密码",
              required: true,
              rules: [
                // eslint-disable-next-line no-template-curly-in-string
                { required: true, message: "请输入${label}" },
              ],
            },
          ],
          actions: [
            {
              actionType: "submit",
              actionText: "登录",
              actionProps: {
                block: true,
              },
            },
          ],
          onFormSubmit: [
            {
              $action: "script",
              script: async (event: RuiEvent) => {
                const formData = await event.sender.form.validateFields();
                try {
                  const res = await MoveStyleUtils.request({
                    method: "POST",
                    url: "/api/signin",
                    data: formData,
                  });
                  message.success("登录成功");
                } catch (err: any) {
                  console.error("Signin failed.", err);
                  const errorMessage = err?.response?.data?.error?.message || err.message;
                  message.error(errorMessage);
                  throw err;
                }
              },
            },
          ],
        } as RapidFormRockConfig,
      ],
    },
  ],
};

export default function SonicEntityList() {
  const page = useMemo(() => {
    const ruiPageConfig: PageConfig = {
      $id: "sonic-entity-list",
      stores: [],
      view: rapidPage.view,
      eventSubscriptions: [],
    };
    return new Page(framework, ruiPageConfig);
  }, []);

  return (
    <div className="rui-play-main-container-body">
      <Rui framework={framework} page={page} />
    </div>
  );
}
