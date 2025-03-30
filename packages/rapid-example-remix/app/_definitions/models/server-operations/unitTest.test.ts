import { ActionHandlerContext } from "@ruiapp/rapid-core";
import unitTestServerOperation from "./unitTest";

test("TireInspectionStandardEntityWatcher.parseGradesText.emptyCondition", () => {
  const handler = unitTestServerOperation.handler;
  const context: ActionHandlerContext = {} as any;
  handler(context as any);

  expect(context.output.result).toBe("ok");
});
