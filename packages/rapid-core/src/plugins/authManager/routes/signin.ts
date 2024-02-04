import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.signin",
  code: "",
  type: "RESTful",
  method: "post",
  endpoint: "/signin",
  handlers: [
    {
      code: "createSession",
    },
  ],
} as RpdRoute;