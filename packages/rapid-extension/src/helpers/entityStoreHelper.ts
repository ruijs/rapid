import { uniq, map, filter } from "lodash";
import { EntityStoreConfig } from "../stores/entity-store";
import { FindEntityFindRelationEntitiesOptions, RapidEntity } from "../types/rapid-entity-types";

export interface GetEntityDetailStoreConfigOptions {
  entityModel: RapidEntity;

  entityId?: string;

  entityIdExpression?: string;

  items: { code: string }[];

  dataSourceCode: string;

  /**
   * 指定数据查询的属性。如果指定了`queryProperties`，则不会自动从`items`和`extraProperties`中提取查询属性。
   */
  queryProperties?: string[];

  /**
   * 数据查询时需要查询的额外属性。
   */
  extraProperties?: string[];

  /**
   * 查询关联对象的设置
   */
  relations?: Record<string, FindEntityFindRelationEntitiesOptions>;

  keepNonPropertyFields?: boolean;
}

export function generateEntityDetailStoreConfig(props: GetEntityDetailStoreConfigOptions) {
  const properties: string[] = uniq(
    props.queryProperties || [
      "id",
      ...map(
        filter(props.items, (item) => !!item.code),
        (item) => item.code,
      ),
      ...(props.extraProperties || []),
    ],
  );
  const detailDataStoreConfig: EntityStoreConfig = {
    type: "entityStore",
    name: props.dataSourceCode || "detail",
    entityModel: props.entityModel,
    keepNonPropertyFields: props.keepNonPropertyFields,
    properties,
    filters: [
      {
        field: "id",
        operator: "eq",
        value: "",
      },
    ],
    relations: props.relations,
    // TODO: Expression should be a static string, so that we can configure it at design time.
    $exps: {
      frozon: `!(${props.entityIdExpression || `${props.entityId}`})`,
      "filters[0].value": props.entityIdExpression || `${props.entityId}`,
    },
  };
  return detailDataStoreConfig;
}
