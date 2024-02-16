import { FindEntityOptions, RunEntityActionHandlerOptions } from "~/types";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";
import { removeFiltersWithNullValue } from "~/dataAccess/filterHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "findCollectionEntities";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: RunEntityActionHandlerOptions,
) {
  await runCollectionEntityActionHandler(
    ctx,
    options,
    code,
    async (entityManager, input: FindEntityOptions) => {
      input.filters = removeFiltersWithNullValue(input.filters);
      const entities = await entityManager.findEntities(input);
      const result: {
        list: any;
        total?: any;
      } = { list: entities };

      if (input.pagination && !input.pagination.withoutTotal) {
        // TOOD: impl count entities by using entity manager, because DataAccessor does not support 'exists' and 'notExists' filter.
        const countResult = await entityManager.count(input);
        result.total = countResult.count;
      }
      return result;
    },
  );
}
