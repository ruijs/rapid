import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.signin",
  code: "",
  type: "RESTful",
  method: "POST",
  endpoint: "/signin",
  handlers: [
    {
      code: "createSession",
    },
  ],
} satisfies RpdRoute;