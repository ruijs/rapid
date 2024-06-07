import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.changePassword",
  code: "auth.changePassword",
  type: "RESTful",
  method: "POST",
  endpoint: "/changePassword",
  actions: [
    {
      code: "changePassword",
    },
  ],
} satisfies RpdRoute;
