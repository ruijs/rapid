import { handleComponentEvent, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./SonicMainSecondaryLayoutMeta";
import type { SonicMainSecondaryLayoutRockConfig } from "./sonic-main-secondary-layout-types";
import { each, map } from "lodash";
import { strictToRockEventHandlers } from "../../utils/rock-utility";

export default {
  onReceiveMessage(message, state, props, rockInstance) {
    if (message.name === "notifySelectedIdsChange") {
      handleComponentEvent("onSelectedIdsChange", message.framework, message.page as any, rockInstance._scope, props, props.main.onSelectedIdsChange, [
        {
          selectedIds: message.payload.selectedIds,
          selectedRecords: message.payload.selectedRecords,
        },
      ]);
    }
  },

  Renderer(context, props) {
    const onSelectedIdsChange = strictToRockEventHandlers(props.onSelectedIdsChange);

    props.main.onSelectedIdsChange = [
      {
        $action: "setVars",
        scopeId: `${props.$id}-scope`,
        $exps: {
          "vars.activeId": "_.first($event.args[0].selectedIds)",
          "vars.activeRecord": "_.first($event.args[0].selectedRecords)",
        },
      },
      {
        $action: "loadScopeData",
        scopeId: `${props.$id}-scope`,
      },

      ...(onSelectedIdsChange.length
        ? onSelectedIdsChange
        : map(props.secondary, (childRock) => {
            return {
              $action: "sendComponentMessage",
              componentId: childRock.$id,
              message: {
                name: "refreshView",
              },
            };
          })),
    ];

    each(props.secondary, (childRock) => {
      // set(childRock, "$exps._hidden", "!$scope.vars.activeId");
    });

    let mainRock = props.main;
    if (props.mainTitle) {
      mainRock = {
        $type: "antdCard",
        bordered: false,
        size: "small",
        title: props.mainTitle,
        className: props.mainClassName,
        children: props.main,
      };
    }

    let secondaryRock = props.secondary;
    if (props.secondaryTitle) {
      secondaryRock = {
        $type: "antdCard",
        bordered: false,
        size: "small",
        title: props.secondaryTitle,
        className: props.secondaryClassName,
        children: props.secondary,
      };
    }

    const rockConfig: RockConfig = {
      $type: "scope",
      $id: `${props.$id}-scope`,
      stores: props.stores,
      children: [
        props.mode === "layout"
          ? {
              $type: "rapidDoubleColumnLayout",
              layoutCacheId: props.layoutCacheId,
              resizable: props.layoutResizable,
              fixedColumn: props.layoutFixedColumn,
              className: props.layoutClassName,
              style: props.layoutStyle,
              fixedChildren: mainRock,
              flexChildren: secondaryRock,
            }
          : {
              $type: "antdRow",
              $id: `${props.$id}-row`,
              gutter: props.gutter || 24,
              children: [
                {
                  $type: "antdCol",
                  $id: `${props.$id}-col-main`,
                  span: props.mainColSpan,
                  children: mainRock,
                },
                {
                  $type: "antdCol",
                  $id: `${props.$id}-col-secondary`,
                  span: props.secondaryColSpan,
                  children: secondaryRock,
                },
              ],
            },
      ],
      eventSubscriptions: [
        // {
        //   eventName: "onActiveIdChange",
        //   handlers: [
        //     {
        //       $action: "setVars",
        //       $exps: {
        //         "vars.activeId": "$event.args[0].activeId",
        //       }
        //     },
        //   ]
        // }
      ],
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidEntityListMeta,
} as Rock<SonicMainSecondaryLayoutRockConfig>;
