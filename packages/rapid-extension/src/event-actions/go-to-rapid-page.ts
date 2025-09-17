import type { EventAction, RockEvent } from "@ruiapp/move-style";
import { stringifyQuery } from "@ruiapp/move-style";

export interface RockEventHandlerGoToRapidPage {
  $action: "goToPage";
  pageCode: string;
  query: Record<string, any>;
}

export async function goToPage(event: RockEvent, handler: RockEventHandlerGoToRapidPage) {
  const { framework } = event;
  const { pageCode, query } = handler;
  const pageBaseUrl = (framework.getExpressionVars().$pageBaseUrl as string) || "/pages";

  let url = `${pageBaseUrl}/${pageCode}`;
  if (query && Object.keys(query).length > 0) {
    url += "?" + stringifyQuery(query);
  }

  location.href = url;
}

export default {
  name: "goToPage",
  handler: goToPage,
} as EventAction<RockEventHandlerGoToRapidPage>;
