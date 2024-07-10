import { RpdRoute } from "~/types";

export default {
  namespace: "svc",
  name: "svc.setSystemSettingValues",
  code: "svc.setSystemSettingValues",
  type: "RESTful",
  method: "PATCH",
  endpoint: "/svc/systemSettingValues",
  actions: [
    {
      code: "setSystemSettingValues",
    },
  ],
} satisfies RpdRoute;
