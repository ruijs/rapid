import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseShift",
  name: "班次",
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "beginTime",
      name: "开始时间",
      type: "time",
      required: true,
    },
    {
      code: "endTime",
      name: "结束时间",
      type: "time",
      required: true,
    },
  ],
};

export default entity;
