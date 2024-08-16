import { RockInstanceContext } from "@ruiapp/move-style";

export function parseStrToFunc(str: string, params: Record<string, any>) {
  const paramNames = Object.keys(params || []);
  const paramValues = paramNames.map((name) => params[name]);
  if (!str) {
    return new Function();
  }

  const trimedStr = str.trim();
  if (trimedStr.indexOf("function") === 0) {
    return new Function(...paramNames, `return ${trimedStr}`)(...paramValues);
  } else {
    return new Function(...paramNames, `return function(){ ${trimedStr} }`)(...paramValues);
  }
}

export function parseRockExpressionFunc(expression: string, params: Record<string, any>, context: RockInstanceContext) {
  return parseStrToFunc(expression, { ...params, ...context.framework.getExpressionVars(), $scope: context.scope, $page: context.page });
}
