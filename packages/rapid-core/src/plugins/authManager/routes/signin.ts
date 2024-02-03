import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.signin",
  code: "",
  type: "RESTful",
  method: "post",
  endpoint: "/api/signin",
  handlers: [
    {
      code: "createSession",
    },
  ],
} as RpdRoute;