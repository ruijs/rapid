import { RpdRoute } from "~/types";

export default {
  namespace: "ecm",
  name: "ecm.uploadFile",
  code: "ecm.uploadFile",
  type: "RESTful",
  method: "POST",
  endpoint: "/upload",
  actions: [
    {
      code: "uploadFile",
    },
  ],
} satisfies RpdRoute;