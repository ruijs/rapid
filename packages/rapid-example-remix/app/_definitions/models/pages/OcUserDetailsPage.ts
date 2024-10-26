import type { RapidCheckboxListFormInputConfig, RapidPage } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "oc_user_details",
  name: "用户详情",
  title: "用户详情",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "rapidEntityDescriptions",
      entityCode: "OcUser",
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
          code: "state",
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
          type: "auto",
          code: "description",
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    },
  ],
};

export default page;
