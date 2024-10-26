import {
  MoveStyleUtils,
  RockChildrenConfig,
  RockEvent,
  RockEventHandler,
  RockPageEventSubscriptionConfig,
  type Rock,
  type RockConfig,
} from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import SonicEntityDetailsMeta from "./SonicEntityDetailsMeta";
import type { SonicEntityDetailsRockConfig } from "./sonic-entity-details-types";
import { differenceBy, find, get, isArray, isEmpty, isNumber, keyBy, omit, set } from "lodash";
import type { RapidEntityListConfig, RapidEntityListRockConfig } from "../rapid-entity-list/rapid-entity-list-types";
import rapidAppDefinition from "../../rapidAppDefinition";
import { generateRockConfigOfError } from "../../rock-generators/generateRockConfigOfError";
import { RapidEntity } from "../../types/rapid-entity-types";
import { EntityStore, RapidTableColumnConfig, RapidToolbarRockConfig } from "../../mod";
import { useState } from "react";
import moment from "moment";
import { RapidExtStorage } from "../../utils/storage-utility";
import { getColumnUniqueKey, ICacheRapidTableColumn } from "../rapid-entity-list-toolbox/RapidEntityListToolbox";
import { getRapidEntityListFilters, RapidEntityListFilterCache } from "../rapid-entity-search-form/RapidEntitySearchForm";
import { generateEntityDetailStoreConfig } from "../../helpers/entityStoreHelper";
import { getEntityPropertyByCode } from "../../helpers/metaHelper";

export default {
  onInit(context, props) {
    const mainEntityCode = props.entityCode;
    const mainEntity = rapidAppDefinition.getEntityByCode(mainEntityCode);
    if (!mainEntity) {
      return;
    }

    if (props.entityId || props.$exps?.entityId) {
      let titlePropertyCode = props.titlePropertyCode;
      if (!titlePropertyCode) {
        const displayPropertyCode = mainEntity.displayPropertyCode || "name";
        const displayProperty = getEntityPropertyByCode(rapidAppDefinition.getAppDefinition(), mainEntity, displayPropertyCode);
        if (displayProperty) {
          titlePropertyCode = displayPropertyCode;
        }
      }

      const detailDataStoreConfig = generateEntityDetailStoreConfig({
        entityModel: mainEntity,
        entityId: props.entityId,
        entityIdExpression: props.$exps?.entityId,
        dataSourceCode: props.dataSourceCode,
        items: props.descriptionItems || props.items,
        extraProperties: [titlePropertyCode, props.subTitlePropertyCode, props.statePropertyCode, ...(props.extraProperties || [])],
        keepNonPropertyFields: props.keepNonPropertyFields,
        queryProperties: props.queryProperties,
        relations: props.relations,
      });
      context.scope.addStore(detailDataStoreConfig);
    }
  },

  Renderer(context, props, state) {
    const { logger, scope } = context;

    const mainEntityCode = props.entityCode;
    const mainEntity = rapidAppDefinition.getEntityByCode(mainEntityCode);
    if (!mainEntity) {
      return;
    }

    let dataSource = props.dataSource;
    if (!dataSource) {
      const dataSourceCode = props.dataSourceCode || "detail";
      dataSource = get(scope.stores[dataSourceCode], "data.list[0]");
    }

    if (!dataSource) {
      return null;
    }

    let titlePropertyCode = props.titlePropertyCode;
    if (!titlePropertyCode) {
      const displayPropertyCode = mainEntity.displayPropertyCode || "name";
      const displayProperty = getEntityPropertyByCode(rapidAppDefinition.getAppDefinition(), mainEntity, displayPropertyCode);
      if (displayProperty) {
        titlePropertyCode = displayPropertyCode;
      }
    }

    let title = "";
    if (titlePropertyCode) {
      title = get(dataSource, titlePropertyCode);
    }

    let subTitle = "";
    let subTitlePropertyCode = props.subTitlePropertyCode;
    if (subTitlePropertyCode) {
      const subTitleProperty = getEntityPropertyByCode(rapidAppDefinition.getAppDefinition(), mainEntity, subTitlePropertyCode);
      if (subTitleProperty) {
        subTitle = get(dataSource, subTitlePropertyCode);
      }
    }

    let statePropertyCode = props.statePropertyCode;
    let stateRockConfig: RockConfig;
    if (statePropertyCode) {
      const stateProperty = getEntityPropertyByCode(rapidAppDefinition.getAppDefinition(), mainEntity, statePropertyCode);
      if (stateProperty) {
        const stateValue = get(dataSource, statePropertyCode);
        stateRockConfig = {
          $id: `${props.$id}-state`,
          $type: "rapidOptionFieldRenderer",
          dictionaryCode: stateProperty.dataDictionary,
          value: stateValue,
        };
      }
    }

    const rockConfig: RockConfig = {
      $id: `${props.$id}-internal`,
      $type: "antdPageHeader",
      title,
      subTitle,
      tags: stateRockConfig,
      extra: props.actions,
      footer: props.footer,
      children: {
        $id: `${props.$id}-descriptions`,
        $type: "rapidEntityDescriptions",
        entityCode: props.entityCode,
        dataSource,
        bordered: props.descriptionBordered,
        size: props.descriptionSize,
        layout: props.descriptionLayout,
        colon: props.descriptionColon,
        column: props.descriptionColumn || props.column,
        items: props.descriptionItems || props.items,
      },
    };
    return renderRock({ context, rockConfig });
  },

  ...SonicEntityDetailsMeta,
} as Rock<SonicEntityDetailsRockConfig>;
