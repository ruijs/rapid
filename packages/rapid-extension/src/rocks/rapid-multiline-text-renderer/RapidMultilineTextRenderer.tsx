import { Rock } from "@ruiapp/move-style";
import RapidMultilineTextRendererMeta from "./RapidMultilineTextRendererMeta";
import { genRockRenderer } from "@ruiapp/react-renderer";
import { RapidMultilineTextRendererProps, RapidMultilineTextRendererRockConfig } from "./rapid-multiline-text-renderer-types";

export function configRapidMultilineTextRenderer(config: RapidMultilineTextRendererRockConfig): RapidMultilineTextRendererRockConfig {
  return config;
}

export function RapidMultilineTextRenderer(props: RapidMultilineTextRendererProps) {
  let { value, defaultText } = props;
  value ??= defaultText;

  return <pre>{value}</pre>;
}

export default {
  Renderer: genRockRenderer(RapidMultilineTextRendererMeta.$type, RapidMultilineTextRenderer, true),
  ...RapidMultilineTextRendererMeta,
} as Rock<RapidMultilineTextRendererRockConfig>;
