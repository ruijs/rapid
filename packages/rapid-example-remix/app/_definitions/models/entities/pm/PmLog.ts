import { PropertySequenceConfig } from "@ruiapp/rapid-core";
import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "PmLog",
  name: "项目日志",
  fields: [
    {
      code: "project",
      name: "项目",
      type: "relation",
      targetSingularCode: "pm_project",
      targetIdColumnName: "project_id",
    },
    {
      code: "logDate",
      name: "日期",
      type: "date",
      required: true,
    },
    {
      code: "content",
      name: "内容",
      type: "text",
    },
    {
      code: "pictures",
      name: "照片",
      type: "image[]",
    },
    {
      code: "attachments",
      name: "附件",
      type: "file[]",
    },
  ],
};

export default entity;
