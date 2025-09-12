import { memoize, set } from "lodash";

const genExpression = memoize(
  (varNames: string[], expressionString: string) => {
    // eslint-disable-next-line no-new-func
    return new Function(...varNames, `return (${expressionString})`);
  },
  (varNames, expressionString) => {
    return varNames.join(",") + ":" + expressionString;
  },
);

export function interpreteExpression(expressionString: string, rootVars: Record<string, any>) {
  const varNames = [];
  const varValues = [];
  for (const name in rootVars) {
    varNames.push(name);
    varValues.push(rootVars[name]);
  }

  let result;
  try {
    const expression = genExpression(varNames, expressionString);
    result = expression(...varValues);
  } catch (err: any) {
    console.error(`Expression interprete error. expression: '${expressionString}', error:`, err.message);
  }
  return result;
}

export function interpreteConfigExpressions(config: Record<string, any>, vars: Record<string, any>) {
  if (!config) {
    return;
  }

  const propExpressions = config.$exps;
  if (!propExpressions) {
    return;
  }

  for (const propName in propExpressions) {
    const propValue = interpreteExpression(propExpressions[propName], vars);
    set(config, propName, propValue);
  }
}
