import { RpdRoute } from "~/types";

export default {
  namespace: "svc",
  name: "svc.updateLicense",
  code: "svc.updateLicense",
  type: "RESTful",
  method: "POST",
  endpoint: "/svc/license",
  actions: [
    {
      code: "updateLicense",
    },
  ],
} satisfies RpdRoute;
