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
import { PropertySequenceConfig } from "./SequencePluginTypes";
import { isEqual } from "lodash";
import { generateSn } from "./SequenceService";
import { isNullOrUndefined } from "~/utilities/typeUtility";


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
        const propertySequenceConfig: PropertySequenceConfig = property.config?.sequence;
        if (propertySequenceConfig) {
          const ruleCode = getSequenceRuleCode(model, property);
          const ruleConfig = propertySequenceConfig.config;

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
            if (isEqual(sequenceRule.config, ruleConfig)) {
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
    const entity = options.entity;
    for (const property of model.properties) {
      const sequenceConfig: PropertySequenceConfig = property.config?.sequence;
      const propertyValue = entity[property.code];
      if (sequenceConfig &&
        sequenceConfig.enabled &&
        isNullOrUndefined(propertyValue)
      ) {
        const ruleCode = getSequenceRuleCode(model, property);
        const numbers = await generateSn(server, {
          ruleCode,
          amount: 1,
          parameters: entity,
        });
        entity[property.code] = numbers[0];
      }
    }
  }
}

function getSequenceRuleCode(model: RpdDataModel, property: RpdDataModelProperty) {
  return `propertyAutoGenerate.${model.namespace}.${model.singularCode}.${property.code}`;
}

export default SequencePlugin;
