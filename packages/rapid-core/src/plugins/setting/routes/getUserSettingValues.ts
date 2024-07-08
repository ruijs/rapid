import { RpdRoute } from "~/types";

export default {
  namespace: "svc",
  name: "svc.getUserSettingValues",
  code: "svc.getUserSettingValues",
  type: "RESTful",
  method: "GET",
  endpoint: "/svc/userSettingValues",
  actions: [
    {
      code: "getUserSettingValues",
    },
  ],
} satisfies RpdRoute;
