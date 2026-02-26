import type { SimpleRockConfig } from "@ruiapp/move-style";

export interface RapidTimePickerProps {
  value?: string | moment.Moment | null;
  onChange?(value: string | null): void;
}

export interface RapidTimePickerRockConfig extends SimpleRockConfig, RapidTimePickerProps {}
