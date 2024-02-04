import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.signout",
  code: "",
  type: "RESTful",
  method: "get",
  endpoint: "/signout",
  handlers: [
    {
      code: "deleteSession",
    },
  ],
} as RpdRoute;