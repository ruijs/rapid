import { RpdRoute } from "~/types";

export default {
  namespace: "svc",
  name: "svc.getSystemSettingValues",
  code: "svc.getSystemSettingValues",
  type: "RESTful",
  method: "POST",
  endpoint: "/svc/getSystemSettingValues",
  actions: [
    {
      code: "getSystemSettingValues",
    },
  ],
} satisfies RpdRoute;
