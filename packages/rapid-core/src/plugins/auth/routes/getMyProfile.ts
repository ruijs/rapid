import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.getMyProfile",
  code: "",
  type: "RESTful",
  method: "GET",
  endpoint: "/me",
  handlers: [
    {
      code: "getMyProfile",
    },
  ],
} satisfies RpdRoute;