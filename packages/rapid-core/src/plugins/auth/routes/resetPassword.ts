import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.resetPassword",
  code: "auth.resetPassword",
  type: "RESTful",
  method: "POST",
  endpoint: "/resetPassword",
  actions: [
    {
      code: "resetPassword",
    },
  ],
} satisfies RpdRoute;
