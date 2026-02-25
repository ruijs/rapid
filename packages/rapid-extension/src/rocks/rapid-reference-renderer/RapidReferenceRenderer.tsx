import { Rock, RockConfig, RockInstance } from "@ruiapp/move-style";
import { find } from "lodash";
import RapidReferenceRendererMeta from "./RapidReferenceRendererMeta";
import { RapidReferenceRendererProps, RapidReferenceRendererRockConfig } from "./rapid-reference-renderer-types";
import { genRockRenderer, renderRock } from "@ruiapp/react-renderer";

export function configRapidReferenceRenderer(config: RapidReferenceRendererRockConfig): RapidReferenceRendererRockConfig {
  return config;
}

export function RapidReferenceRenderer(props: RapidReferenceRendererProps) {
  const { list, value, valueFieldName, textFieldName, itemRenderer, $id, _context: context } = props;

  const item = find(list, (item) => {
    return item[valueFieldName] == value;
  });
  if (!item) {
    return null;
  }

  if (itemRenderer) {
    const rockConfig = {
      ...itemRenderer,
      value: item,
      $id: `${$id}-rdr`,
    } as RockConfig;

    return renderRock({ context, rockConfig });
  }

  return "" + item[textFieldName];
}

export default {
  Renderer: genRockRenderer(RapidReferenceRendererMeta.$type, RapidReferenceRenderer),
  ...RapidReferenceRendererMeta,
} as Rock<RapidReferenceRendererRockConfig>;
