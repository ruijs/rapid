import type { MetaFunction } from "@remix-run/node";
import { Framework, Page, PageConfig } from "@ruiapp/move-style";
import { Rui } from "@ruiapp/react-renderer";
import { Rui as RuiRock, ErrorBoundary, Show, HtmlElement, Anchor, Box, Label, List, Scope, Text } from "@ruiapp/react-rocks";
import AntdExtension from "@ruiapp/antd-extension";
import MonacoExtension from "@ruiapp/monaco-extension";
import RapidExtension, { rapidAppDefinition, RapidEntityFormConfig, RapidExtensionSetting, RapidPage } from '@ruiapp/rapid-extension';
import _, { cloneDeep } from "lodash";
import qs from "qs";
import { RuiLoggerProvider } from "../rui-logger";
import EntityModels from "../_definitions/meta/entity-models";
import DataDictionaryModels from "../_definitions/meta/data-dictionary-models";
import { useMemo } from "react";

import antdStyles from 'antd/dist/antd.css';
import appStyles from '~/styles/app.css';

export function links() {
  return [antdStyles, appStyles].map((styles) => {
    return { rel: 'stylesheet', href: styles };
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
  currencyCode: 'CNY',
});

rapidAppDefinition.setAppDefinition({
  entities: EntityModels,
  dataDictionaries: DataDictionaryModels,
})

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: 'auto',
      code: 'title',
    },
    {
      type: 'textarea',
      code: 'description',
    },
    {
      type: 'auto',
      code: 'state',
    },
  ],
}

const rapidPage: RapidPage = {
  code: 'pm_task_list',
  name: '任务列表',
  title: '任务管理',
  permissionCheck: {any: []},
  view: [
    {
      $type: "htmlElement",
      htmlTag: "h2",
      children: [
        {
          $type: "text",
          text: "value-auto-generate",
        },
      ]
    },
    {
      $type: "sonicEntityList",
      entityCode: "PmTask",
      viewMode: "table",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
        }
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "Search",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["title", "description"],
        }
      ],
      orderBy: [
        {
          field: 'id',
          desc: true,
        }
      ],
      pageSize: 20,
      columns: [
        {
          type: 'auto',
          code: 'code',
          width: '100px',
        },
        {
          type: 'auto',
          code: 'title',
          width: '200px',
        },
        {
          type: 'auto',
          code: 'description',
        },
        {
          type: 'auto',
          code: 'state',
          width: '100px',
        },
      ],
      actions: [
        {
          $type: "rapidTableAction",
          code: "finish",
          actionText: "完成任务",
          $exps: {
            // _hidden: "$slot.record.state !== 'done'",
          },
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { $operation: { type: "finish" } },
              $exps: {
                url: `"/api/app/pm_tasks/" + $event.sender['data-record-id']`,
              },
            },
            {
              $action: "loadStoreData",
              storeName: "list",
            },
          ],
        },
        {
          $type: "sonicRecordActionEditEntity",
          code: 'edit',
          actionType: "edit",
          actionText: '修改',
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: 'delete',
          actionType: 'delete',
          actionText: '删除',
          dataSourceCode: "list",
          entityCode: "PmTask",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      searchForm: {
        entityCode: 'PmTask',
        items: [
          {
            type: 'auto',
            code: 'title',
            filterMode: 'contains',
          },
        ],
      },
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
