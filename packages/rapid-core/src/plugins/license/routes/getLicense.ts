import { RpdRoute } from "~/types";

export default {
  namespace: "svc",
  name: "svc.getLicense",
  code: "svc.getLicense",
  type: "RESTful",
  method: "GET",
  endpoint: "/svc/license",
  actions: [
    {
      code: "getLicense",
    },
  ],
} satisfies RpdRoute;
