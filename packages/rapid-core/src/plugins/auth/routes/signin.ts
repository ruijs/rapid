import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.signin",
  code: "",
  type: "RESTful",
  method: "POST",
  endpoint: "/signin",
  actions: [
    {
      code: "createSession",
    },
  ],
} satisfies RpdRoute;