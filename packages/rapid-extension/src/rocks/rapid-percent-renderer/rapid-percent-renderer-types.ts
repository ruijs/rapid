import { RapidNumberRendererProps, RapidNumberRendererRockConfig } from "../rapid-number-renderer/rapid-number-renderer-types";

export interface RapidPercentRendererProps extends RapidNumberRendererProps {}

export interface RapidPercentRendererRockConfig extends RapidPercentRendererProps, Omit<RapidNumberRendererRockConfig, "value"> {}
