/**
 * State machine plugin
 */

import {
  CreateEntityOptions,
  RpdApplicationConfig,
  RpdDataModel,
  RpdDataModelProperty,
  UpdateEntityByIdOptions,
} from "~/types";
import { IRpdServer, RapidPlugin, RpdConfigurationItemOptions, RpdServerPluginConfigurableTargetOptions, RpdServerPluginExtendingAbilities } from "~/core/server";

import pluginActionHandlers from "./actionHandlers";
import pluginModels from "./models";
import pluginRoutes from "./routes";
import { filter, find, first, get, isEqual } from "lodash";
import { PropertyStateMachineConfig } from "./StateMachinePluginTypes";
import { isNullOrUndefined } from "~/utilities/typeUtility";
import { getStateMachineNextSnapshot } from "./stateMachineHelper";


class StateMachinePlugin implements RapidPlugin {
  get code(): string {
    return "stateMachinePlugin";
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
        const propertyStateMachineConfig: PropertyStateMachineConfig = property.config?.stateMachine;
        if (propertyStateMachineConfig) {
          const stateMachineCode = getStateMachineCode(model, property);
          const stateMachineConfig = propertyStateMachineConfig.config;

          const stateMachineDataAccessor = server.getDataAccessor({
            singularCode: "state_machine",
          });
          const stateMachine = await stateMachineDataAccessor.findOne({
            filters: [
              {
                operator: "eq",
                field: "code",
                value: stateMachineCode,
              },
            ],
          });

          if (stateMachine) {
            if (!isEqual(stateMachine.config, stateMachineConfig)) {
              await stateMachineDataAccessor.updateById(stateMachine.id, {
                config: stateMachineConfig,
              });
            }
          } else {
            await stateMachineDataAccessor.create({
              code: stateMachineCode,
              config: stateMachineConfig,
            });
          }
        }
      }
    }
  }

  /**
   * 创建实体前的处理。
   * 当属性启用了状态机管理，如创建实体时没有指定该属性的状态值，则应将该属性设置为 stateMachine.config.initial 。
   * @param server 
   * @param model 
   * @param options 
   */
  async beforeCreateEntity(server: IRpdServer, model: RpdDataModel, options: CreateEntityOptions) {
    for (const property of model.properties) {
      const isStateMachineEnabled = get(property.config, "stateMachine.enabled", false);
      if (isStateMachineEnabled && isNullOrUndefined(options.entity[property.code])
      ) {
        const initialState = get(property.config, "stateMachine.config.initial", null);
        if (initialState) {
          options.entity[property.code] = initialState;
        }
      }
    }
  }

  /**
   * 更新实体前的处理。
   * 1. 对所有启用了状态机管理，且 transferControl 为 true 的属性，应禁止直接更新这些属性
   * 2. 当更新实体时指定了operation，则查找启用了状态机管理的属性。
   * 如果一个模型中存在多个属性启用了状态机管理，则以 options.stateProperty 中指定的为准。
   * 对于该状态属性应用 options.operation，使其转换到下一状态。
   * @param server 
   * @param model 
   * @param options 
   */
  async beforeUpdateEntity(server: IRpdServer, model: RpdDataModel, options: UpdateEntityByIdOptions, currentEntity: any) {
    const entity = options.entityToSave;

    const stateMachineEnabledProperties: RpdDataModelProperty[] = [];
    for (const property of model.properties) {
      const isStateMachineEnabled = get(property.config, "stateMachine.enabled", false);

      if (isStateMachineEnabled) {
        stateMachineEnabledProperties.push(property);

        const isTransferControlEnabled = get(property.config, "stateMachine.transferControl", false);
        if (isTransferControlEnabled && !isNullOrUndefined(entity[property.code])) {
          throw new Error(`You're not allowed to change '${property.code}' property directly when transfer control is enabled, do an operation instead.`);
        }
      }
    }

    if (!options.operation) {
      return;
    }

    let statePropertiesToUpdate: RpdDataModelProperty[];
    const statePropertyCodes = options.stateProperties;
    if (statePropertyCodes && statePropertyCodes.length) {
      statePropertiesToUpdate = filter(stateMachineEnabledProperties, (property) => statePropertyCodes.includes(property.code));
    } else {
      statePropertiesToUpdate = stateMachineEnabledProperties;
    }

    if (!statePropertiesToUpdate.length) {
      throw new Error(`State machine property not found.`);
    }

    for (const statePropertyToUpdate of statePropertiesToUpdate) {
      const machineConfig = get(statePropertyToUpdate.config, "stateMachine.config", null);
      if (!machineConfig) {
        throw new Error(`State machine of property '${statePropertyToUpdate.code}' not configured.`);
      }
      machineConfig.id = getStateMachineCode(model, statePropertyToUpdate);
  
      const nextSnapshot = await getStateMachineNextSnapshot({
        machineConfig,
        context: {},
        currentState: currentEntity[statePropertyToUpdate.code],
        event: options.operation,
      });
  
      entity[statePropertyToUpdate.code] = nextSnapshot.value;
    }
  }
}

function getStateMachineCode(model: RpdDataModel, property: RpdDataModelProperty) {
  return `propertyStateMachine.${model.namespace}.${model.singularCode}.${property.code}`;
}

export default StateMachinePlugin;
