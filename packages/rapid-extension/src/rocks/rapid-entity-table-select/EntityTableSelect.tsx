import { EventEmitter, RockConfig, type Rock } from "@ruiapp/move-style";
import { EntityTableSelectRockConfig } from "./entity-table-select-types";
import { renderRock } from "@ruiapp/react-renderer";
import ModelTableSelectorMeta from "./EntityTableSelectMeta";
import rapidAppDefinition from "../../rapidAppDefinition";
import { useEffect } from "react";

const bus = new EventEmitter();

export default {
  onReceiveMessage(message, state, props) {
    if (message.name === "refreshData") {
      bus.emit(`${props.$id}-refresh`, message.payload);
    } else if (message.name === "reload") {
      bus.emit(`${props.$id}-reload`);
    }
  },
  Renderer(context, props) {
    const { entityCode, requestParams, ...restProps } = props;

    let entityConfig = null;
    if (entityCode) {
      entityConfig = rapidAppDefinition.getEntityByCode(entityCode);
    }

    useEffect(() => {
      const refreshEventKey = `${props.$id}-refresh`;
      const refreshHandler = () => {
        context.page.sendComponentMessage(`${props.$id}-tableselect`, {
          name: "refreshData",
        });
      };
      const reloadEventKey = `${props.$id}-reload`;
      const reloadHandler = () => {
        context.page.sendComponentMessage(`${props.$id}-tableselect`, {
          name: "reload",
        });
      };

      bus.on(refreshEventKey, refreshHandler);
      bus.on(reloadEventKey, reloadHandler);
      return () => {
        bus.off(refreshEventKey, refreshHandler);
        bus.off(reloadEventKey, reloadHandler);
      };
    }, [props.$id]);

    const rockConfig: RockConfig = {
      ...restProps,
      $id: `${props.$id}-tableselect`,
      $type: "rapidTableSelect",
      requestConfig: {
        url: `/${entityConfig?.namespace}/${entityConfig?.pluralCode}/operations/find`,
        method: "post",
        params: {
          properties: entityConfig?.fields?.map((f) => f.code) || [],
          ...(requestParams || {}),
        },
      },
      $exps: props.$exps,
    };

    return renderRock({ context, rockConfig });
  },

  ...ModelTableSelectorMeta,
} as Rock<EntityTableSelectRockConfig>;
