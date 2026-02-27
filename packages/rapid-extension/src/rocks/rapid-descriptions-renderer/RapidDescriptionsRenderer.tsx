import { Rock, RockConfig } from "@ruiapp/move-style";
import { genRockRenderer, renderRock } from "@ruiapp/react-renderer";
import { Descriptions } from "antd";
import type { DescriptionsProps } from "antd";
import RapidDescriptionsRendererMeta from "./RapidDescriptionsRendererMeta";
import { RapidDescriptionsRendererProps, RapidDescriptionsRendererRockConfig } from "./rapid-descriptions-renderer-types";
import { get } from "lodash";
import RapidExtensionSetting from "../../RapidExtensionSetting";

export function configRapidDescriptionsRenderer(config: RapidDescriptionsRendererRockConfig): RapidDescriptionsRendererRockConfig {
  return config;
}

export function RapidDescriptionsRenderer(props: RapidDescriptionsRendererProps & { $id?: string; _context?: any }) {
  const { $id, value, title, layout, size, bordered, colon, column, labelStyle, items, extra, _context: context } = props;

  const antdProps: DescriptionsProps = {
    title,
    layout,
    bordered,
    size,
    colon,
    column: column || 1,
    labelStyle,
    extra: extra ? extra() : undefined,
  };

  return (
    <Descriptions {...antdProps}>
      {items
        ?.filter((item) => !item.hidden && !item._hidden)
        .map((item, index) => {
          const rendererType = item.rendererType || RapidExtensionSetting.getDefaultRendererTypeOfFieldType(item.valueFieldType);
          const defaultRendererProps = RapidExtensionSetting.getDefaultRendererProps(item.valueFieldType, rendererType);

          const itemDisplayRockConfig: RockConfig = {
            $id: `${$id}-item-${index}-display`,
            $type: rendererType,
            ...defaultRendererProps,
            ...item.rendererProps,
            value: get(value, item.valueFieldName || item.code),
          };

          return (
            <Descriptions.Item key={index} label={item.label || item.code} span={item.column} labelStyle={item.labelStyle} contentStyle={item.contentStyle}>
              {renderRock({ context, rockConfig: itemDisplayRockConfig })}
            </Descriptions.Item>
          );
        })}
    </Descriptions>
  );
}

export default {
  Renderer: genRockRenderer(RapidDescriptionsRendererMeta.$type, RapidDescriptionsRenderer, true),
  ...RapidDescriptionsRendererMeta,
} as Rock<RapidDescriptionsRendererRockConfig>;
