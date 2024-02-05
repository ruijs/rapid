import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.signout",
  code: "",
  type: "RESTful",
  method: "GET",
  endpoint: "/signout",
  handlers: [
    {
      code: "deleteSession",
    },
  ],
} satisfies RpdRoute;