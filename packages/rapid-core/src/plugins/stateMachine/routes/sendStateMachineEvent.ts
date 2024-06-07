import { RpdRoute } from "~/types";

export default {
  namespace: "svc",
  name: "svc.sendStateMachineEvent",
  code: "svc.sendStateMachineEvent",
  type: "RESTful",
  method: "POST",
  endpoint: "/svc/sendStateMachineEvent",
  actions: [
    {
      code: "sendStateMachineEvent",
    },
  ],
} satisfies RpdRoute;
