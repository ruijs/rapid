import type { SimpleRockConfig } from "@ruiapp/move-style";

export interface RapidMonthPickerProps {
  value?: string | moment.Moment | null;
  onChange?(value: string | null): void;
}

export interface RapidMonthPickerRockConfig extends SimpleRockConfig, RapidMonthPickerProps {}
