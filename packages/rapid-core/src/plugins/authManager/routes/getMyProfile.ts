import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.getMyProfile",
  code: "",
  type: "RESTful",
  method: "get",
  endpoint: "/api/me",
  handlers: [
    {
      code: "getMyProfile",
    },
  ],
} as RpdRoute;