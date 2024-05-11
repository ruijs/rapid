/**
 * Sequence plugin
 */

import {
  CreateEntityOptions,
  RpdApplicationConfig,
  RpdDataModel,
  RpdDataModelProperty,
} from "~/types";
import { IRpdServer, RapidPlugin, RpdConfigurationItemOptions, RpdServerPluginConfigurableTargetOptions, RpdServerPluginExtendingAbilities } from "~/core/server";

import pluginActionHandlers from "./actionHandlers";
import pluginModels from "./models";
import pluginRoutes from "./routes";
import { RouteContext } from "~/core/routeContext";
import { PropertySequenceConfig } from "./sequence-types";
import { isNull, isUndefined } from "lodash";
import { generateSn } from "./SequenceService";


class SequencePlugin implements RapidPlugin {
  get code(): string {
    return "sequencePlugin";
  }

  get description(): string {
    return null;
  }

  get extendingAbilities(): RpdServerPluginExtendingAbilities[] {
    return [];
  }

  get configurableTargets(): RpdServerPluginConfigurableTargetOptions[] {
    return [];
  }

  get configurations(): RpdConfigurationItemOptions[] {
    return [];
  }

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    for (const actionHandler of pluginActionHandlers) {
      server.registerActionHandler(this, actionHandler);
    }
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ models: pluginModels });
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig) {
    const models = server.getApplicationConfig().models;
    for (const model of models) {
      for (const property of model.properties) {
        const sequenceConfig: PropertySequenceConfig = property.config?.sequence;
        if (sequenceConfig) {
          const ruleCode = getSequenceRuleCode(model, property);
          const ruleConfig = sequenceConfig.ruleConfig;

          const sequenceRuleDataAccessor = server.getDataAccessor({
            singularCode: "sequence_rule",
          });
          const sequenceRule = await sequenceRuleDataAccessor.findOne({
            filters: [
              {
                operator: "eq",
                field: "code",
                value: ruleCode,
              },
            ],
          });

          if (sequenceRule) {
            if (JSON.stringify(sequenceRule.config) !== JSON.stringify(ruleConfig)) {
              await sequenceRuleDataAccessor.updateById(sequenceRule.id, {
                config: ruleConfig,
              });
            }
          } else {
            await sequenceRuleDataAccessor.create({
              code: ruleCode,
              config: ruleConfig,
            });
          }
        }
      }
    }
  }

  async beforeCreateEntity(server: IRpdServer, model: RpdDataModel, options: CreateEntityOptions) {
    debugger;
    const entity = options.entity;
    for (const property of model.properties) {
      const sequenceConfig: PropertySequenceConfig = property.config?.sequence;
      const propertyValue = entity[property.code];
      if (sequenceConfig &&
        sequenceConfig.autoGenerate &&
        (isUndefined(propertyValue) || isNull(propertyValue))
      ) {
        const ruleCode = getSequenceRuleCode(model, property);
        const sns = await generateSn(server, {
          ruleCode,
          amount: 1,
          parameters: entity,
        });
        entity[property.code] = sns[0];
      }
    }
  }
}

function getSequenceRuleCode(model: RpdDataModel, property: RpdDataModelProperty) {
  return `propertyAutoGenerate.${model.namespace}.${model.singularCode}.${property.code}`;
}

export default SequencePlugin;
