import { RpdRoute } from "~/types";

export default {
  namespace: "svc",
  name: "svc.runCronJob",
  code: "svc.runCronJob",
  type: "RESTful",
  method: "POST",
  endpoint: "/svc/runCronJob",
  actions: [
    {
      code: "runCronJob",
    },
  ],
} satisfies RpdRoute;