import type { RapidCheckboxListFormInputConfig, RapidPage, SonicEntityDetailsRockConfig } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "oc_user_details",
  name: "用户详情",
  title: "用户详情",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicEntityDetails",
      entityCode: "OcUser",
      column: 3,
      extraProperties: ["actions"],
      subTitlePropertyCode: "email",
      statePropertyCode: "state",
      items: [
        {
          code: "login",
        },
        {
          code: "birthday",
        },
        {
          code: "department",
        },
        {
          code: "createdBy",
        },
        {
          code: "createdAt",
        },
        {
          code: "roles",
          rendererProps: {
            item: {
              $type: "rapidLinkRenderer",
              url: "/pages/oc_role_details?id={{id}}",
              text: "{{name}}",
            },
          },
        },
        {
          code: "description",
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    } satisfies SonicEntityDetailsRockConfig,
  ],
};

export default page;
