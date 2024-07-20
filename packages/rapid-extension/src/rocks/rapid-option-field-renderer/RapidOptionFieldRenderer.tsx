import type { Rock, RockConfig } from "@ruiapp/move-style";
import RapidOptionFieldRendererMeta from "./RapidOptionFieldRendererMeta";
import type { RapidOptionFieldRendererRockConfig } from "./rapid-option-field-renderer-types";
import { renderRock } from "@ruiapp/react-renderer";
import { find, isArray, merge } from "lodash";
import rapidAppDefinition from "../../rapidAppDefinition";

export default {
  Renderer(context, props: RapidOptionFieldRendererRockConfig) {
    const { dictionaryCode, value } = props;

    if (!value) {
      return null;
    }

    const dataDictionaries = rapidAppDefinition.getDataDictionaries();
    let dataDictionary = find(dataDictionaries, { code: dictionaryCode });
    if (!dataDictionary) {
      return "" + value;
    }

    const itemRockConfig: RockConfig = {
      $id: `${props.$id}`,
      $type: "rapidReferenceRenderer",
      list: dataDictionary.entries,
      itemRenderer: {
        $type: "rapidDictionaryEntryRenderer",
      },
      valueFieldName: "value",
      textFieldName: "name",
      value,
    } as RockConfig;

    if (isArray(value)) {
      const arrayRendererProps = merge(props.arrayRendererProps || {}, {
        item: itemRockConfig,
        noSeparator: true,
      });

      return renderRock({
        context,
        rockConfig: {
          $type: "rapidArrayRenderer",
          ...arrayRendererProps,
          value,
        },
      });
    } else {
      return renderRock({ context, rockConfig: itemRockConfig });
    }
  },

  ...RapidOptionFieldRendererMeta,
} as Rock;
