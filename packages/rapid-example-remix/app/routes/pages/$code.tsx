import { Framework, Page, PageConfig } from "@ruiapp/move-style";
import { Rui } from "@ruiapp/react-renderer";
import { Rui as RuiRock, ErrorBoundary, Show, HtmlElement, Anchor, Box, Label, List, Scope, Text } from "@ruiapp/react-rocks";
import AntdExtension from "@ruiapp/antd-extension";
import MonacoExtension from "@ruiapp/monaco-extension";
import RapidExtension, { rapidAppDefinition, RapidEntityFormConfig, RapidExtensionSetting, RapidPage } from "@ruiapp/rapid-extension";
import _, { cloneDeep, find } from "lodash";
import qs from "qs";
import { RuiLoggerProvider } from "../../rui-logger";
import EntityModels from "../../_definitions/meta/entity-models";
import DataDictionaryModels from "../../_definitions/meta/data-dictionary-models";
import Pages from "../../_definitions/meta/page-models";
import { useMemo } from "react";

import antdStyles from "antd/dist/antd.css";
import appStyles from "~/styles/app.css";
import { useParams } from "@remix-run/react";

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
      code: "name",
    },
    {
      type: "textarea",
      code: "description",
    },
    {
      type: "auto",
      code: "roles",
    },
    {
      type: "auto",
      code: "orderNum",
    },
    {
      type: "auto",
      code: "state",
    },
  ],
};

const rapidPage: RapidPage = {
  code: "oc_role_list",
  name: "角色列表",
  title: "角色管理",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "htmlElement",
      htmlTag: "h2",
      children: [
        {
          $type: "text",
          text: "selectionMode: multiple",
        },
      ],
    },
    {
      $type: "sonicEntityList",
      entityCode: "OcRole",
      viewMode: "table",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "Search",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["name", "description"],
        },
      ],
      orderBy: [
        {
          field: "orderNum",
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "link",
          code: "name",
          fixed: "left",
          width: "300px",
          rendererProps: {
            url: "/pages/oc_role_details?id={{id}}",
          },
        },
        {
          type: "auto",
          code: "description",
        },
        {
          type: "auto",
          code: "orderNum",
          width: "100px",
        },
        {
          type: "auto",
          code: "state",
          width: "100px",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
        },
        {
          $type: "rapidTableAction",
          code: "disable",
          actionText: "禁用",
          $exps: {
            _hidden: "$slot.record.state !== 'enabled'",
          },
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { state: "disabled" },
              $exps: {
                url: `"/api/app/oc_roles/" + $event.sender['data-record-id']`,
              },
            },
            {
              $action: "loadStoreData",
              storeName: "list",
            },
          ],
        },
        {
          $type: "rapidTableAction",
          code: "enable",
          actionText: "启用",
          $exps: {
            _hidden: "$slot.record.state === 'enabled'",
          },
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { state: "enabled" },
              $exps: {
                url: `"/api/app/oc_roles/" + $event.sender['data-record-id']`,
              },
            },
            {
              $action: "loadStoreData",
              storeName: "list",
            },
          ],
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "OcRole",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      searchForm: {
        entityCode: "OcRole",
        items: [
          {
            type: "auto",
            code: "name",
            filterMode: "contains",
          },
        ],
      },
    },
    {
      $type: "htmlElement",
      htmlTag: "h2",
      children: [
        {
          $type: "text",
          text: "selectionMode: single",
        },
      ],
    },
    {
      $type: "sonicEntityList",
      entityCode: "OcRole",
      viewMode: "table",
      selectionMode: "single",
      listActions: [],
      extraActions: [],
      orderBy: [
        {
          field: "orderNum",
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "link",
          code: "name",
          fixed: "left",
          width: "300px",
          rendererProps: {
            url: "/pages/oc_role_details?id={{id}}",
          },
        },
        {
          type: "auto",
          code: "description",
        },
        {
          type: "auto",
          code: "orderNum",
          width: "100px",
        },
        {
          type: "auto",
          code: "state",
          width: "100px",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
      ],
      actions: [],
    },
    {
      $type: "htmlElement",
      htmlTag: "h2",
      children: [
        {
          $type: "text",
          text: "selectionMode: none",
        },
      ],
    },
    {
      $type: "sonicEntityList",
      entityCode: "OcRole",
      viewMode: "table",
      selectionMode: "none",
      listActions: [],
      extraActions: [],
      orderBy: [
        {
          field: "orderNum",
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "link",
          code: "name",
          fixed: "left",
          width: "300px",
          rendererProps: {
            url: "/pages/oc_role_details?id={{id}}",
          },
        },
        {
          type: "auto",
          code: "description",
        },
        {
          type: "auto",
          code: "orderNum",
          width: "100px",
        },
        {
          type: "auto",
          code: "state",
          width: "100px",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
      ],
      actions: [],
    },
  ],
};

export default function SonicEntityList() {
  const params = useParams();
  const pageCode = params.code || "";

  const page = useMemo(() => {
    const pageConfig = find(Pages, (page) => page.code === pageCode);
    let ruiPageConfig: PageConfig;
    if (pageConfig) {
      ruiPageConfig = {
        $id: pageConfig.code,
        stores: pageConfig.stores,
        view: pageConfig.view as any,
        eventSubscriptions: pageConfig.eventSubscriptions,
      };
    } else {
      ruiPageConfig = {
        $id: pageCode,
        view: [{ $type: "text", text: `Page with code '${pageCode}' was not configured.` }],
      };
    }
    return new Page(framework, ruiPageConfig);
  }, [pageCode]);

  return (
    <div className="rui-play-main-container-body">
      <Rui framework={framework} page={page} />
    </div>
  );
}
