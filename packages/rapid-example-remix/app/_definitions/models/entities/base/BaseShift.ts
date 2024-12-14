import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseShift",
  name: "班次",
  locales: {
    "en-US": {
      name: "Shift",
    },
    "zh-CN": {
      name: "班次",
    },
  },
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
      locales: {
        "en-US": {
          name: "Name",
        },
        "zh-CN": {
          name: "名称",
        },
      },
    },
    {
      code: "beginTime",
      name: "开始时间",
      type: "time",
      required: true,
      locales: {
        "en-US": {
          name: "Begin Time",
        },
        "zh-CN": {
          name: "开始时间",
        },
      },
    },
    {
      code: "endTime",
      name: "结束时间",
      type: "time",
      required: true,
      locales: {
        "en-US": {
          name: "End Time",
        },
        "zh-CN": {
          name: "结束时间",
        },
      },
    },
  ],
};

export default entity;
