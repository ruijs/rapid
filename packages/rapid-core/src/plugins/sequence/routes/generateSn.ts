import { RpdRoute } from "~/types";

export default {
  namespace: "svc",
  name: "svc.generateSn",
  code: "svc.generateSn",
  type: "RESTful",
  method: "POST",
  endpoint: "/svc/generateSn",
  actions: [
    {
      code: "generateSn",
    },
  ],
} satisfies RpdRoute;
