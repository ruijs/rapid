import type { RockMeta } from "@ruiapp/move-style";
import RapidForm from "../rapid-form/RapidForm";
import { RAPID_ENTITY_FORM_ROCK_TYPE } from "./rapid-entity-form-types";

export default {
  $type: RAPID_ENTITY_FORM_ROCK_TYPE,

  slots: {
    ...RapidForm.slots,
  },

  propertyPanels: [...RapidForm.propertyPanels!],
} as RockMeta;
