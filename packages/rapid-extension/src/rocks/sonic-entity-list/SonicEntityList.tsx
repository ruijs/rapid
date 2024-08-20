import { MoveStyleUtils, RockChildrenConfig, RockEvent, RockEventHandler, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./SonicEntityListMeta";
import type { SonicEntityListRockConfig } from "./sonic-entity-list-types";
import { differenceBy, find, get, isArray, isEmpty, keyBy, omit, set } from "lodash";
import type { RapidEntityListConfig, RapidEntityListRockConfig } from "../rapid-entity-list/rapid-entity-list-types";
import rapidAppDefinition from "../../rapidAppDefinition";
import { generateRockConfigOfError } from "../../rock-generators/generateRockConfigOfError";
import { RapidEntity } from "../../types/rapid-entity-types";
import { EntityStore, RapidTableColumnConfig, RapidToolbarRockConfig } from "../../mod";
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { RapidExtStorage } from "../../utils/storage-utility";
import { getColumnUniqueKey, ICacheRapidTableColumn } from "../rapid-entity-list-toolbox/RapidEntityListToolbox";

const DEFAULT_PAGE_SIZE = 10;

export default {
  onResolveState(props, state) {
    const [rerenderKey, setRerenderKey] = useState<string | number>("");

    return {
      rerenderKey,
      rerenderDom: () => {
        setRerenderKey(moment().unix());
      },
    };
  },
  onReceiveMessage(message, state, props) {
    if (message.name === "refreshView") {
      message.page.sendComponentMessage(`${props.$id}-rapidEntityList`, {
        name: "refreshView",
      });
    } else if (message.name === "submitNewForm") {
      message.page.sendComponentMessage(`${props.$id}-newForm`, {
        name: "submit",
      });
    } else if (message.name === "submitEditForm") {
      message.page.sendComponentMessage(`${props.$id}-editForm`, {
        name: "submit",
      });
    } else if (message.name === "resetNewForm") {
      message.page.sendComponentMessage(`${props.$id}-newForm`, {
        name: "resetFields",
      });
    } else if (message.name === "resetEditForm") {
      message.page.sendComponentMessage(`${props.$id}-editForm`, {
        name: "resetFields",
      });
    } else if (message.name === "rerenderDom") {
      state.rerenderDom();
    }
  },

  Renderer(context, props, state) {
    const entities = rapidAppDefinition.getEntities();
    const entityCode = props.entityCode;
    let entityName = props.entityName;

    const dataSourceCode = props.dataSourceCode || "list";
    const pageSize = get(props, "pageSize", DEFAULT_PAGE_SIZE);
    let entityListRockConfig: RapidEntityListRockConfig = {
      ...(omit(MoveStyleUtils.omitSystemRockConfigFields(props), ["newForm", "editForm"]) as RapidEntityListConfig),
      dataSourceCode,
      pageSize,
      $type: "rapidEntityList",
      $id: `${props.$id}-rapidEntityList`,
    };

    // 动态 开启/关闭 树展示
    if (get(props, "$exps.convertListToTree")) {
      set(entityListRockConfig, "$exps.convertListToTree", get(props, "$exps.convertListToTree"));
    }

    const toolboxRockConfig = {
      $type: "rapidEntityListToolbox",
      $id: `${props.$id}_toolbox`,
      columns: props.columns,
      config: props.toolbox || {
        columnCacheKey: props.entityCode || props.entityName,
      },
      onRerender: [
        {
          $action: "script",
          script: () => {
            state.rerenderDom();
          },
        },
      ],
    };

    const originColumns = props.columns || [];
    const cacheColumns = RapidExtStorage.get<ICacheRapidTableColumn[]>(toolboxRockConfig.config.columnCacheKey);
    if (isArray(cacheColumns) && !isEmpty(cacheColumns)) {
      const diffOriginColumns = differenceBy(originColumns, cacheColumns, getColumnUniqueKey);
      const originByCodeMap = keyBy<RapidTableColumnConfig>(originColumns, getColumnUniqueKey);

      let sortedColumns: RapidEntityListRockConfig["columns"] = [];
      let showColumns: RapidEntityListRockConfig["columns"] = [];
      let hideColumnCodes: string[] = [];
      cacheColumns.forEach((col) => {
        const uniqueKey = getColumnUniqueKey(col as any);
        const originColumn = originByCodeMap[uniqueKey];
        if (originColumn) {
          sortedColumns.push(originColumn);
          if (!col.hidden) {
            showColumns.push(originColumn);
          } else {
            hideColumnCodes.push(col.code);
          }
        }
      });

      entityListRockConfig.extraProperties = [...(entityListRockConfig.extraProperties || []), ...hideColumnCodes];
      entityListRockConfig.columns = [...showColumns, ...diffOriginColumns];
      toolboxRockConfig.columns = [...sortedColumns, ...diffOriginColumns];
    }

    let mainEntity: RapidEntity | undefined;
    if (entityCode) {
      mainEntity = find(entities, (item) => item.code === entityCode);
      if (!entityName) {
        entityName = mainEntity?.name;
      }

      if (!mainEntity) {
        return renderRock({ context, rockConfig: generateRockConfigOfError(new Error(`Entity '${entityCode}' not found.`)) });
      }
    }

    let toolbarExtraActions: RockConfig[] = props.extraActions || [];
    if (props.searchForm) {
      toolbarExtraActions = [
        ...toolbarExtraActions,
        {
          $id: `${props.$id}-advancedSearchButton`,
          $type: "anchor",
          children: [
            {
              $type: "text",
              text: "高级搜索 ",
            },
            {
              $type: "antdIcon",
              name: "DownOutlined",
              $exps: {
                name: `$scope.vars["searchBoxVisible"] ? "UpOutlined" : "DownOutlined"`,
              },
            },
          ],
          onClick: [
            {
              $action: "script",
              script: (event: RockEvent) => {
                event.scope.setVars({
                  searchBoxVisible: !event.scope.vars["searchBoxVisible"],
                });
              },
            },
          ],
        },
        toolboxRockConfig,
      ];
    }

    const toolbarRockConfig: RapidToolbarRockConfig = {
      $id: `${props.$id}-toolbar`,
      $type: "rapidToolbar",
      items: props.listActions,
      extras: toolbarExtraActions,
      dataSourceCode: props.dataSourceCode,
    };

    const searchFormRockConfig: RockConfig | null = props.searchForm
      ? {
          $id: `${props.$id}-searchForm`,
          $type: "rapidEntitySearchForm",
          entityCode: entityCode,
          items: props.searchForm.items,
          actionsAlign: "right",
          onSearch: [
            {
              $action: "script",
              script: async (event: RockEvent) => {
                const store: EntityStore = event.scope.getStore("list");
                store.updateConfig({
                  filters: event.args[0].filters,
                  pagination:
                    pageSize > 0
                      ? {
                          limit: pageSize,
                          offset: 0,
                        }
                      : undefined,
                });
                // 重新加载数据
                store.loadData();
              },
            },
          ],
        }
      : null;

    const newModalRockConfig: RockConfig | null = props.newForm
      ? {
          $type: "antdModal",
          $id: `${props.$id}-newModal`,
          title: `新建${entityName}`,
          okText: "确定",
          cancelText: "取消",
          maskClosable: false,
          $exps: {
            open: "!!$scope.vars['modal-newEntity-open']",
            confirmLoading: "!!$scope.vars['modal-saving']",
          },
          children: [
            {
              $type: "rapidEntityForm",
              $id: `${props.$id}-newForm`,
              entityCode: entityCode,
              mode: "new",
              ...omit(props.newForm, ["entityCode", "onSaveSuccess", "onSaveError"]),
              onFormSubmit: [
                {
                  $action: "setVars",
                  vars: {
                    "modal-saving": true,
                  },
                },
              ],
              onSaveSuccess: [
                {
                  $action: "setVars",
                  vars: {
                    "modal-newEntity-open": false,
                    "modal-saving": false,
                  },
                },
                ...(props.newForm?.onSaveSuccess
                  ? (props.newForm.onSaveSuccess as RockEventHandler[])
                  : [
                      {
                        $action: "loadStoreData",
                        storeName: "list",
                      },
                    ]),
              ],
              onSaveError: [
                {
                  $action: "setVars",
                  vars: {
                    "modal-saving": false,
                  },
                },
                ...((props.newForm?.onSaveError as RockEventHandler[]) || []),
              ],
            },
          ],
          onOk: [
            {
              $action: "sendComponentMessage",
              componentId: props.$id,
              message: {
                name: "submitNewForm",
              },
            },
          ],
          onCancel: [
            {
              $action: "setVars",
              vars: {
                "modal-newEntity-open": false,
              },
            },
          ],
        }
      : null;

    const editModalRockConfig: RockConfig | null = props.editForm
      ? {
          $type: "antdModal",
          $id: `${props.$id}-editModal`,
          title: `修改${entityName}`,
          okText: "确定",
          cancelText: "取消",
          maskClosable: false,
          $exps: {
            open: "!!$scope.vars['modal-editEntity-open']",
            confirmLoading: "!!$scope.vars['modal-saving']",
          },
          children: [
            {
              $type: "rapidEntityForm",
              $id: `${props.$id}-editForm`,
              entityCode: entityCode,
              mode: "edit",
              ...omit(props.editForm, ["entityCode"]),
              $exps: {
                entityId: "$scope.vars.activeEntityId",
              },
              onFormSubmit: [
                {
                  $action: "setVars",
                  vars: {
                    "modal-saving": true,
                  },
                },
              ],
              onSaveSuccess: [
                {
                  $action: "setVars",
                  vars: {
                    "modal-editEntity-open": false,
                    "modal-saving": false,
                  },
                },
                ...(props.editForm?.onSaveSuccess
                  ? (props.editForm.onSaveSuccess as RockEventHandler[])
                  : [
                      {
                        $action: "loadStoreData",
                        storeName: "list",
                      },
                    ]),
              ],
              onSaveError: [
                {
                  $action: "setVars",
                  vars: {
                    "modal-saving": false,
                  },
                },
                ...((props.editForm?.onSaveError as RockEventHandler[]) || []),
              ],
            },
          ],
          onOk: [
            {
              $action: "sendComponentMessage",
              componentId: props.$id,
              message: {
                name: "submitEditForm",
              },
            },
          ],
          onCancel: [
            {
              $action: "setVars",
              vars: {
                "modal-editEntity-open": false,
              },
            },
          ],
        }
      : null;

    const childrenConfig: RockChildrenConfig = [];
    childrenConfig.push(toolbarRockConfig);

    if (searchFormRockConfig) {
      childrenConfig.push({
        $id: `${props.$id}-searchBox`,
        $type: "box",
        style: {
          backgroundColor: "#f2f2f2",
          borderRadius: "5px",
          padding: "24px",
          paddingBottom: "0",
          marginBottom: "12px",
        },
        children: searchFormRockConfig,
        $exps: {
          "style.display": `$scope.vars["searchBoxVisible"] ? "block" : "none"`,
        },
      });
    }

    childrenConfig.push(entityListRockConfig);
    if (newModalRockConfig) {
      childrenConfig.push(newModalRockConfig);
    }
    if (editModalRockConfig) {
      childrenConfig.push(editModalRockConfig);
    }
    const footerRockConfig = props.footer;
    if (footerRockConfig) {
      if (isArray(footerRockConfig)) {
        childrenConfig.push(...footerRockConfig);
      } else {
        childrenConfig.push(footerRockConfig);
      }
    }

    const rockConfig: RockConfig = {
      $id: `${props.$id}-scope`,
      $type: "scope",
      stores: props.stores,
      children: childrenConfig,
      eventSubscriptions: [
        {
          eventName: "onRefreshButtonClick",
          handlers: [
            {
              $action: "loadStoreData",
              storeName: "list",
            },
          ],
        },
        {
          eventName: "onNewEntityButtonClick",
          handlers: [
            {
              $action: "setVars",
              vars: {
                "modal-newEntity-open": true,
              },
            },
            {
              $action: "sendComponentMessage",
              componentId: props.$id,
              message: {
                name: "resetNewForm",
              },
            },
          ],
        },
        {
          eventName: "onEditEntityButtonClick",
          handlers: [
            {
              $action: "setVars",
              vars: {
                "modal-editEntity-open": true,
              },
              $exps: {
                "vars.activeEntityId": "$event.sender['data-record-id']",
              },
            },
            {
              $action: "loadStoreData",
              storeName: "detail",
            },
            {
              $action: "wait",
              time: 0,
            },
            {
              $action: "sendComponentMessage",
              componentId: props.$id,
              message: {
                name: "resetEditForm",
              },
            },
          ],
        },
      ],
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidEntityListMeta,
} as Rock<SonicEntityListRockConfig>;
