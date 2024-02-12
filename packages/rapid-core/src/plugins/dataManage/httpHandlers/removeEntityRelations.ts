import { RunEntityHttpHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { isRelationProperty } from "~/utilities/rapidUtility";
import { HttpHandlerContext } from "~/core/httpHandler";
import { RapidPlugin } from "~/core/server";

export const code = "removeEntityRelations";

interface RemoveEntityRelationsInput {
  id: number;
  property: string;
  relations: {id?: number, [k: string]: any}[];
}

export async function handler(
  plugin: RapidPlugin,
  ctx: HttpHandlerContext,
  options: RunEntityHttpHandlerOptions,
) {
  const { server, input } = ctx;
  const { queryBuilder } = server;
  const { defaultInput, fixedInput } = options;

  console.debug(`Running ${code} handler...`);

  console.debug(`defaultInput: ${JSON.stringify(defaultInput)}`);
  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  console.debug(`fixedInput: ${JSON.stringify(fixedInput)}`);
  console.debug(`mergedInput: ${JSON.stringify(mergedInput)}`);

  const dataAccessor = server.getDataAccessor(options);
  const model = dataAccessor.getModel();

  const {id, property, relations} = mergedInput as RemoveEntityRelationsInput;
  const row = await dataAccessor.findById(id);
  if (!row) {
    throw new Error(`${options.namespace}.${options.singularCode}  with id "${id}" was not found.`);
  }

  console.log(mergedInput);

  const relationProperty = model.properties.find(e => e.code === property);
  if (!relationProperty) {
    throw new Error(`Property '${property}' was not found in ${options.namespace}.${options.singularCode}`);
  }

  if (!(isRelationProperty(relationProperty) && relationProperty.relation === "many")) {
    throw new Error(`Operation 'createEntityRelations' is only supported on property of 'many' relation`);
  }

  if (relationProperty.linkTableName) {
    for (const relation of relations) {
      const command = `DELETE FROM ${queryBuilder.quoteTable({schema:relationProperty.linkSchema, tableName: relationProperty.linkTableName})}
  WHERE ${queryBuilder.quoteObject(relationProperty.selfIdColumnName!)}=$1 AND ${queryBuilder.quoteObject(relationProperty.targetIdColumnName!)}=$2;`;
      const params = [id, relation.id];
      await server.queryDatabaseObject(command, params);
    }
  }

  ctx.output = {};

  server.emitEvent(
    "entity.removeRelations",
    plugin,
    {
      namespace: options.namespace,
      modelSingularCode: options.singularCode,
      entity: row,
      property,
      relations: relations,
    },
  );
}
