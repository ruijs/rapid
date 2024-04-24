import { MoveStyleUtils, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./SonicToolbarSelectEntityButtonMeta";
import type { SonicToolbarSelectEntityButtonRockConfig } from "./sonic-toolbar-select-entity-button-types";
import rapidAppDefinition from "../../rapidAppDefinition";
import { find } from "lodash";

export default {
  onInit(context, props) {
  },

  onReceiveMessage(message, state, props) {
  },

  Renderer(context, props) {
    const entities = rapidAppDefinition.getEntities();
    const entityCode = props.entityCode;
    let entityName = props.entityName;
    if (!entityName) {
      const mainEntity = find(entities, item => item.code === entityCode);
      entityName = mainEntity?.name;
    }

    const buttonRockConfig: RockConfig = {
      ...MoveStyleUtils.omitSystemRockConfigFields(props),
      $id: `${props.$id}-btn`,
      $type: "rapidToolbarButton",
      onAction: [
        {
          $action: "setVars",
          vars: {
            "modal-selectEntity-open": true,
          }
        },
      ]
    };

    const modalRockConfig: RockConfig = {
      $type: "antdModal",
      $id: `${props.$id}-modal`,
      title: `选择${entityName}`,
      ...props.modalProps,
      $exps: {
        open: "!!$scope.vars['modal-selectEntity-open']",
      },
      children: [
        {
          $type: "sonicEntityList",
          entityCode: entityCode,
          viewMode: "table",
          selectionMode: "multiple",
          fixedFilters: props.fixedFilters,
          extraProperties: props.extraProperties,
          queryProperties: props.queryProperties,
          orderBy: props.orderBy || [
            {
              field: 'id',
            },
          ],
          pageSize: props.pageSize,
          extraActions: props.extraActions || ((props.quickSearchMode || props.quickSearchFields) ? [
            {
              $type: "sonicToolbarFormItem",
              formItemType: "search",
              placeholder: "Search",
              actionEventName: "onSearch",
              filterMode: props.quickSearchMode || "contains",
              filterFields: props.quickSearchFields || ["name"],
            }
          ] : null),
          columns: props.columns || [
            {
              type: 'auto',
              code: 'name',
            },
          ],
          onSelectedIdsChange: [
            {
              $action: "setVars",
              scopeId: `${props.$id}-scope`,
              $exps: {
                "vars.selectedIds": "$event.args[0].selectedIds",
                "vars.selectedRecords": "$event.args[0].selectedRecords",
              }
            }
          ]
        }
      ],
      onOk: [
        {
          $action: "handleEvent",
          eventName: "onSelected",
          handlers: props.onSelected,
          $exps: {
            args: "[{selectedIds: $scope.vars.selectedIds, selectedRecords: $scope.vars.selectedRecords}]",
          }
        },
        {
          $action: "setVars",
          vars: {
            "modal-selectEntity-open": false,
          }
        },
      ],
      onCancel: [
        {
          $action: "setVars",
          vars: {
            "modal-selectEntity-open": false,
          }
        }
      ],
    };

    const rockConfig: RockConfig = {
      $type: "scope",
      $id: `${props.$id}-scope`,
      children: [
        buttonRockConfig,
        modalRockConfig,
      ]
    }

    return renderRock({context, rockConfig: rockConfig});
  },

  ...RapidEntityListMeta
} as Rock<SonicToolbarSelectEntityButtonRockConfig>;