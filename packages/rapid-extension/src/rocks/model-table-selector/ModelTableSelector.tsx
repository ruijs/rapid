import { RockConfig, type Rock } from "@ruiapp/move-style";
import { ModelTableSelectorRockConfig } from "./model-table-selector-types";
import { renderRock } from "@ruiapp/react-renderer";
import ModelTableSelectorMeta from "./ModelTableSelectorMeta";
import rapidAppDefinition from "../../rapidAppDefinition";
import { autoConfigureRapidEntity } from "../../mod";

export default {
  Renderer(context, props) {
    const { entityCode, requestParams, ...restProps } = props;

    let entityConfig = null;
    if (entityCode) {
      const entity = rapidAppDefinition.getEntityByCode(entityCode);
      entityConfig = autoConfigureRapidEntity(entity, rapidAppDefinition.getEntities());
    }

    const rockConfig: RockConfig = {
      $type: "tableSelector",
      ...restProps,
      requestConfig: {
        url: `/${entityConfig?.namespace}/${entityConfig?.pluralCode}/operations/find`,
        method: "post",
        params: {
          properties: entityConfig?.fields?.map((f) => f.code) || [],
          ...(requestParams || {}),
        },
      },
    };

    return renderRock({ context, rockConfig });
  },

  ...ModelTableSelectorMeta,
} as Rock<ModelTableSelectorRockConfig>;
