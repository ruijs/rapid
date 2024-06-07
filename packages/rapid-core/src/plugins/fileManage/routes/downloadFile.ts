import { RpdRoute } from "~/types";

export default {
  namespace: "ecm",
  name: "ecm.downloadFile",
  code: "ecm.downloadFile",
  type: "RESTful",
  method: "GET",
  endpoint: "/download/file",
  actions: [
    {
      code: "downloadFile",
    },
  ],
} satisfies RpdRoute;
