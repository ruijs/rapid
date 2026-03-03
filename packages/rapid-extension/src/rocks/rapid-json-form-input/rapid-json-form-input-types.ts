import type { SimpleRockConfig } from "@ruiapp/move-style";

export const RAPID_JSON_FORM_INPUT_ROCK_TYPE = "rapidJsonFormInput" as const;

export type RapidJsonFormInputProps = {
  value?: any;
  onChange?(value: any): void;
};

export interface RapidJsonFormInputRockConfig extends SimpleRockConfig, RapidJsonFormInputProps {
  $type: typeof RAPID_JSON_FORM_INPUT_ROCK_TYPE;
}
