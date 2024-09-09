import { handleComponentEvent, type Rock, type RockChildrenConfig, type RockConfig, type RockEvent, Scope, MoveStyleUtils } from "@ruiapp/move-style";
import { renderRock, renderRockChildren } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./RapidEntityListMeta";
import type { RapidEntityListRockConfig, RapidEntityListState } from "./rapid-entity-list-types";
import { findIndex, forEach, merge, reject, set, trim, uniq, map, filter } from "lodash";
import rapidAppDefinition from "../../rapidAppDefinition";
import { generateRockConfigOfError } from "../../rock-generators/generateRockConfigOfError";
import type { RapidEntity, RapidField } from "../../types/rapid-entity-types";
import type { EntityStore, EntityStoreConfig } from "../../stores/entity-store";
import RapidExtensionSetting from "../../RapidExtensionSetting";
import { parseRockExpressionFunc } from "../../mod";
import { useEffect } from "react";


function initStore(scope: Scope, props: RapidEntityListRockConfig) {
  const entityCode = props.entityCode;
  if (!entityCode) {
    return;
  }

  const mainEntity = rapidAppDefinition.getEntityByCode(entityCode);
  if (!mainEntity) {
    return;
  }

  const dataSourceCode = props.dataSourceCode || "list";
  const store = scope.stores[dataSourceCode] as EntityStore;

  if (store && store.name == dataSourceCode && store.entityCode == mainEntity.code) {
    return;
  }

  const { columns, pageSize } = props;
  const properties: string[] = uniq(
    props.queryProperties || [
      "id",
      ...map(
        filter(columns, (column) => !!column.code),
        (column) => column.code,
      ),
      ...(props.extraProperties || []),
    ],
  );
  const listDataStoreConfig: EntityStoreConfig = {
    type: "entityStore",
    name: dataSourceCode,
    entityModel: mainEntity,
    fixedFilters: props.fixedFilters,
    keepNonPropertyFields: props.keepNonPropertyFields,
    properties,
    relations: props.relations,
    orderBy: props.orderBy || [
      {
        field: "id",
      },
    ],
    pagination:
      pageSize > 0
        ? {
          limit: pageSize,
          offset: ((props.pageNum || 1) - 1) * pageSize,
        }
        : undefined,
  };
  scope.addStore(listDataStoreConfig);
  if (MoveStyleUtils.canUseDOM()) {
    scope.loadStoreData(dataSourceCode, null);
  }
}

export default {
  onResolveState(props, state) {
    return {
      selectedIds: [],
    };
  },

  onInit(context, props) {
    initStore(context.scope as Scope, props);
  },

  onReceiveMessage(message, state, props, rockInstance) {
    if (message.name === "refreshView") {
      if (props.dataSourceType === "dataSource") {
        return;
      }

      rockInstance._scope.stores[props.dataSourceCode]?.loadData();
    }
  },

  Renderer(context, props, state) {
    const { logger, page } = context;
    const entityCode = props.entityCode;
    let mainEntity: RapidEntity | undefined;

    if (entityCode) {
      mainEntity = rapidAppDefinition.getEntityByCode(entityCode);
      if (!mainEntity) {
        const errorRockConfig = generateRockConfigOfError(new Error(`Entitiy with code '${entityCode}' not found.`));
        return renderRock({ context, rockConfig: errorRockConfig });
      }
    }

    const dataSourceCode = props.dataSourceCode || "list";
    const tableColumnRocks: RockConfig[] = [];

    useEffect(() => {
      initStore(context.scope, props);
    }, [dataSourceCode, entityCode]);

    props.columns.forEach((column) => {
      let cell: RockConfig | RockConfig[] | null = null;

      let rpdField: RapidField | undefined;
      if (mainEntity) {
        const fieldName = column.fieldName || column.code;
        const fieldNameParts = fieldName.split(".");
        rpdField = rapidAppDefinition.getEntityFieldByCode(mainEntity, fieldNameParts[0]);

        if (!column.title && rpdField) {
          column.title = rpdField.name;
        }

        if (fieldNameParts.length > 1 && rpdField) {
          const rpdRelationEntity = rapidAppDefinition.getEntityBySingularCode(rpdField.targetSingularCode);
          if (rpdRelationEntity) {
            rpdField = rapidAppDefinition.getEntityFieldByCode(rpdRelationEntity, fieldNameParts[1]);
          }
        }

        if (!rpdField) {
          logger.warn(props, `Unknown field code '${column.code}'`);
        }
      }

      if (column.$exps) {
        page.interpreteComponentProperties(null, column as any, {
          $self: column,
          $parent: props,
        });
      }

      if (column.cell) {
        cell = column.cell;
      } else if (column.type === "link") {
        const url: string | undefined = column.rendererProps?.url;
        const text: string | undefined = column.rendererProps?.text;
        if (url) {
          cell = {
            $type: "anchor",
            href: url,
            children: {
              $type: "text",
              $exps: {
                text: text ? `$rui.execVarText('${text}', $slot.record)` : "$slot.value",
              },
            },
            $exps: {
              href: `$rui.execVarText('${url}', $slot.record)`,
              ...(column.rendererProps?.$exps || {}),
            },
          };
        }
      } else if (column.type === "auto") {
        let fieldType = column.fieldType || rpdField?.type || "text";
        let rendererType = column.rendererType || RapidExtensionSetting.getDefaultRendererTypeOfFieldType(fieldType);
        let defaultRendererProps: any = RapidExtensionSetting.getDefaultRendererProps(fieldType, rendererType);
        let fieldTypeRelatedRendererProps: any = {};
        if (rpdField) {
          if (fieldType === "option" || fieldType === "option[]") {
            fieldTypeRelatedRendererProps = {
              dictionaryCode: rpdField.dataDictionary,
            };
          } else if ((fieldType === "relation" || fieldType === "relation[]") && !column.rendererType) {
            if (rpdField.relation === "many") {
              rendererType = "rapidArrayRenderer";
            } else {
              rendererType = "rapidObjectRenderer";
            }

            const relationEntity = rapidAppDefinition.getEntityBySingularCode(rpdField.targetSingularCode);
            if (relationEntity?.displayPropertyCode) {
              fieldTypeRelatedRendererProps.format = `{{${relationEntity.displayPropertyCode}}}`;
            }
          }
        }

        cell = {
          $type: rendererType,
          ...defaultRendererProps,
          ...fieldTypeRelatedRendererProps,
          ...column.rendererProps,
          $exps: {
            value: "$slot.value",
            ...(column.rendererProps?.$exps || {}),
          },
        };
      } else {
        cell = {
          $type: "text",
          text: `Unknown column type: ${column.type}`,
        };
      }

      const tableColumnRock: RockConfig = {
        ...column,
        $type: "rapidTableColumn",
        cell,
      };
      tableColumnRocks.push(tableColumnRock);
    });

    if (!props.hideActionsColumn) {
      forEach(props.actions, (recordActionConfig) => {
        set(recordActionConfig, "$exps.record", "$slot.record");
        set(recordActionConfig, "$exps.recordId", "$slot.record.id");
      });

      if (props.actions && props.actions.length) {
        const tableActionsColumnRock: RockConfig = {
          $type: "rapidTableColumn",
          title: "操作",
          code: "id",
          key: "_actions",
          width: props.actionsColumnWidth || "150px",
          fixed: "right",
          cell: props.actions,
        };
        tableColumnRocks.push(tableActionsColumnRock);
      }
    }

    let rowSelection = props.rowSelection;
    const selectionMode = props.selectionMode || "multiple";
    if (selectionMode !== "none") {
      rowSelection = {
        ...rowSelection,
        type: selectionMode === "multiple" ? "checkbox" : "radio",
        onChange: [
          {
            $action: "setVars",
            $exps: {
              [`vars.${props.$id}-selectedIds`]: "$event.args[0]",
              [`vars.${props.$id}-selectedRecords`]: "$event.args[1]",
            },
          },
          {
            $action: "handleEvent",
            eventName: "onSelectedIdsChange",
            handlers: props.onSelectedIdsChange,
            $exps: {
              args: "[{selectedIds: $event.args[0], selectedRecords: $event.args[1]}]",
            },
          },
        ],
      };
    }

    const dataSourceTotal = (props.dataSource || []).length;
    let tableExps: Record<string, string> = {
      pagination:
        props.pageSize > 0
          ? `{pageSize: ${props.pageSize}, current: $scope.vars["${`stores-${dataSourceCode}-pageNum`}"], total: ${dataSourceTotal} }`
          : "false",
    };

    if (props.dataSourceType !== "dataSource") {
      tableExps = {
        dataSource: `$scope.stores.${dataSourceCode}?.data?.list`,
        pagination:
          props.pageSize > 0
            ? `{pageSize: ${
              props.pageSize
            }, current: $scope.vars["${`stores-${dataSourceCode}-pageNum`}"], total: $scope.stores.${dataSourceCode}?.data?.total}`
            : "false",
      };
    }

    if (typeof props.getRowSelectionCheckboxProps === "string" && trim(props.getRowSelectionCheckboxProps)) {
      rowSelection = merge({}, rowSelection, {
        getCheckboxProps: (record) => {
          const adapter = parseRockExpressionFunc(props.getRowSelectionCheckboxProps, { record }, context);
          return adapter();
        },
      });
    }

    const tableRockConfig: RockConfig = {
      $id: `${props.$id}-table`,
      $type: "rapidTable",
      $exps: {
        ...tableExps,
        ...(selectionMode !== "none"
          ? {
            "rowSelection.selectedRowKeys": `$scope.vars['${props.$id}-selectedIds']`,
          }
          : {}),
      },
      size: "small",
      rowKey: "id",
      rowSelection,
      columns: tableColumnRocks,
      dataSource: props.dataSource,
      expandedRow: props.expandedRow,
      showHeader: props.showHeader,
      ...props.tableProps,
      convertListToTree: props.convertListToTree,
      dataSourceAdapter: props.dataSourceAdapter,
      listIdField: props.listIdField,
      listParentField: props.listParentField,
      treeChildrenField: props.treeChildrenField,
      onRowClick: props.selectOnClickRow
        ? [
          {
            $action: "script",
            script: async (event: RockEvent) => {
              const { framework, page, scope } = event;
              let nextSelectedIds = [];
              let nextSelectedRecords = [];
              const { record } = event.args[0];
              const recordId = record.id;
              if (selectionMode === "single") {
                nextSelectedIds.push(recordId);
                nextSelectedRecords.push(record);
              } else if (selectionMode === "multiple") {
                const currentSelectedIds = scope.vars[`${props.$id}-selectedIds`] || [];
                const currentSelectedRecords = scope.vars[`${props.$id}-selectedRecords`] || [];
                if (findIndex(currentSelectedIds, (item) => item === recordId) === -1) {
                  nextSelectedIds = [...currentSelectedIds, recordId];
                  nextSelectedRecords = [...currentSelectedRecords, record];
                } else {
                  nextSelectedIds = reject(currentSelectedIds, (item) => item === recordId);
                  nextSelectedRecords = reject(currentSelectedRecords, (item) => item.id === recordId);
                }
              }
              scope.setVars({
                [`${props.$id}-selectedIds`]: nextSelectedIds,
                [`${props.$id}-selectedRecords`]: nextSelectedRecords,
              });
              handleComponentEvent("onSelectedIdsChange", framework, page as any, scope, props, props.onSelectedIdsChange, [
                {
                  selectedIds: nextSelectedIds,
                  selectedRecords: nextSelectedRecords,
                },
              ]);
            },
          },
        ]
        : null,
      onChange: [
        {
          $action: "script",
          script: async (event: RockEvent) => {
            const [pagination] = event.args;
            event.scope.setVars({
              [`stores-${dataSourceCode}-pageNum`]: pagination.current,
            });

            if (props.dataSourceType === "dataSource") {
              return;
            }

            const store: EntityStore = event.scope.stores[dataSourceCode] as any;
            store.setPagination({
              limit: props.pageSize,
              offset: ((pagination.current || 1) - 1) * props.pageSize
            });
            await store.loadData();
          },
        },
      ],
    };

    const rockChildrenConfig: RockChildrenConfig = [tableRockConfig];

    return renderRockChildren({ context, rockChildrenConfig });
  },

  ...RapidEntityListMeta,
} as Rock<RapidEntityListRockConfig, RapidEntityListState>;
