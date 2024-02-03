import { IPluginInstance, RunEntityHttpHandlerOptions } from "~/types";
import runCollectionEntityHttpHandler from "~/helpers/runCollectionEntityHttpHandler";
import { removeFiltersWithNullValue } from "~/dataAccess/filterHelper";
import { HttpHandlerContext } from "~/core/httpHandler";

export const code = "countCollectionEntities";

export async function handler(
  plugin: IPluginInstance,
  ctx: HttpHandlerContext,
  options: RunEntityHttpHandlerOptions,
) {
  await runCollectionEntityHttpHandler(
    ctx,
    options,
    code,
    (dataAccessor, input) => {
      input.filters = removeFiltersWithNullValue(input.filters);
      return dataAccessor.count(input);
    },
  );
}
