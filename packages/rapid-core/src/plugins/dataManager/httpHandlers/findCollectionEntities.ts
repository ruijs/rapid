import * as _ from "lodash";
import { FindEntityOptions, IPluginInstance, RunEntityHttpHandlerOptions } from "~/types";
import runCollectionEntityHttpHandler from "~/helpers/runCollectionEntityHttpHandler";
import { findEntities } from "~/dataAccess/entityManager";
import { removeFiltersWithNullValue } from "~/dataAccess/filterHelper";
import { HttpHandlerContext } from "~/core/httpHandler";

export const code = "findCollectionEntities";

export async function handler(
  plugin: IPluginInstance,
  ctx: HttpHandlerContext,
  options: RunEntityHttpHandlerOptions,
) {
  await runCollectionEntityHttpHandler(
    ctx,
    options,
    code,
    async (dataAccessor, input: FindEntityOptions) => {
      input.filters = removeFiltersWithNullValue(input.filters);
      const entities = await findEntities(ctx.server, dataAccessor, input);
      const result: {
        list: any;
        total?: any;
      } = { list: entities };

      if (input.pagination && !input.pagination.withoutTotal) {
        // TOOD: impl count entities by using entity manager, because DataAccessor does not support 'exists' and 'notExists' filter.
        const countResult = await dataAccessor.count(input);
        result.total = countResult.count;
      }
      return result;
    },
  );
}
