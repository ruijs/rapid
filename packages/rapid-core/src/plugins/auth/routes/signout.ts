import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.signout",
  code: "",
  type: "RESTful",
  method: "GET",
  endpoint: "/signout",
  actions: [
    {
      code: "deleteSession",
    },
  ],
} satisfies RpdRoute;