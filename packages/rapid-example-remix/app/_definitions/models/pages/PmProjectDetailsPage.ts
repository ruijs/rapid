import type { RapidCheckboxListFormInputConfig, RapidEntityFormRockConfig, RapidPage, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "pm_project_details",
  name: "项目详情",
  title: "项目详情",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "rapidEntityForm",
      entityCode: "PmProject",
      mode: "view",
      column: 2,
      extraProperties: ["actions"],
      items: [
        {
          type: "auto",
          code: "name",
        },
        {
          type: "auto",
          code: "allowedTaskTypes",
        },
        {
          type: "auto",
          code: "createdBy",
        },
        {
          type: "auto",
          code: "createdAt",
        },
        {
          type: "auto",
          code: "description",
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    } satisfies RapidEntityFormRockConfig,
  ],
};

export default page;
