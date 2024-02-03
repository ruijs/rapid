import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.signout",
  code: "",
  type: "RESTful",
  method: "get",
  endpoint: "/api/signout",
  handlers: [
    {
      code: "deleteSession",
    },
  ],
} as RpdRoute;