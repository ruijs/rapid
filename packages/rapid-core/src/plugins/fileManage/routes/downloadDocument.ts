import { RpdRoute } from "~/types";

export default {
  namespace: "ecm",
  name: "ecm.downloadDocument",
  code: "ecm.downloadDocument",
  type: "RESTful",
  method: "GET",
  endpoint: "/download/document",
  actions: [
    {
      code: "downloadDocument",
    },
  ],
} satisfies RpdRoute;
