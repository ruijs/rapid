import { RpdRoute } from "~/types";

export default {
  namespace: "auth",
  name: "auth.getMyProfile",
  code: "auth.getMyProfile",
  type: "RESTful",
  method: "GET",
  endpoint: "/me",
  actions: [
    {
      code: "getMyProfile",
    },
  ],
} satisfies RpdRoute;
