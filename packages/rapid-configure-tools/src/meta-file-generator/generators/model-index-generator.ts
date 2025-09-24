/**
 * 用于生成模型索引文件，将模型定义按照类型分别导出。
 */

import fs from "fs";
import { forEach } from "lodash";
import path from "path";
import { ensureDirectoryExists, enumFileBaseNamesInDirectory } from "@ruiapp/rapid-core";

export interface GenerateConfigurationIndexFileOptions {
  /**
   * Where is the models directory.
   */
  modelsDir: string;
  /**
   * where we should output the models index file.
   */
  outputDir: string;
  /**
   * Where is the model type definition file.
   */
  typeDefFilePath: string;
  /**
   * The directory name of the configuration files.
   */
  configurationDirName: string;
  /**
   * The model type name in the `configurationDirName`.
   */
  configurationTypeName: string;

  indexFileName: string;

  extraImports?: string[];

  modelWrapper?: string;

  flattenModelArray?: boolean;
}

export function generateEntityConfigIndexFile({
  modelsDir,
  outputDir,
  typeDefFilePath,
  configurationDirName,
  configurationTypeName,
  indexFileName,
  extraImports,
  modelWrapper,
  flattenModelArray,
}: GenerateConfigurationIndexFileOptions) {
  const filesDir = path.join(modelsDir, configurationDirName);
  const fileNames = enumFileBaseNamesInDirectory({
    dirPath: filesDir,
    fileNameFilter(fileName) {
      return !(fileName.endsWith(".test.js") || fileName.endsWith(".test.ts"));
    },
  });

  const models = fileNames.map((fileName) => {
    return {
      modelName: fileName.replaceAll("/", "$"),
      fileName,
    };
  });

  const codes = [];
  codes.push(`import type { ${configurationTypeName} as T${configurationTypeName} } from '${typeDefFilePath}';`);
  forEach(extraImports, (extraImport) => {
    codes.push(extraImport);
  });

  for (const model of models) {
    const { modelName, fileName } = model;
    if (fileName.includes(" ")) {
      continue;
    }
    codes.push(`import ${modelName} from '../models/${configurationDirName}/${fileName}';`);
  }
  codes.push("");

  codes.push("const entityDefinitions = [");
  for (const model of models) {
    const { modelName, fileName } = model;
    if (fileName.includes(" ")) {
      continue;
    }

    if (flattenModelArray) {
      codes.push(`  ...${modelName},`);
    } else {
      codes.push(`  ${modelName},`);
    }
  }
  codes.push(`];`);

  codes.push(`const configuredEntities:T${configurationTypeName}[] = [`);

  for (const model of models) {
    const { modelName, fileName } = model;
    if (fileName.includes(" ")) {
      continue;
    }

    if (flattenModelArray) {
      codes.push(`  ...${modelWrapper}(${modelName}, entityDefinitions),`);
    } else {
      codes.push(`  ${modelWrapper}(${modelName}, entityDefinitions),`);
    }
  }
  codes.push(`];`);
  codes.push("export default configuredEntities;");
  codes.push("");

  fs.writeFileSync(path.join(outputDir, indexFileName + ".ts"), codes.join("\n"));
}

export function generateConfigIndexFile({
  modelsDir,
  outputDir,
  typeDefFilePath,
  configurationDirName,
  configurationTypeName,
  indexFileName,
  extraImports,
  modelWrapper,
  flattenModelArray,
}: GenerateConfigurationIndexFileOptions) {
  const filesDir = path.join(modelsDir, configurationDirName);
  const fileNames = enumFileBaseNamesInDirectory({
    dirPath: filesDir,
    fileNameFilter(fileName) {
      return !(fileName.endsWith(".test.js") || fileName.endsWith(".test.ts"));
    },
  });

  const models = fileNames.map((fileName) => {
    return {
      modelName: fileName.replaceAll("/", "$"),
      fileName,
    };
  });

  const codes = [];
  codes.push(`import type { ${configurationTypeName} as T${configurationTypeName} } from '${typeDefFilePath}';`);
  forEach(extraImports, (extraImport) => {
    codes.push(extraImport);
  });

  for (const model of models) {
    const { modelName, fileName } = model;
    if (fileName.includes(" ")) {
      continue;
    }
    codes.push(`import ${modelName} from '../models/${configurationDirName}/${fileName}';`);
  }
  codes.push("");

  codes.push("export default [");
  for (const model of models) {
    const { modelName, fileName } = model;
    if (fileName.includes(" ")) {
      continue;
    }

    if (flattenModelArray) {
      if (modelWrapper) {
        codes.push(`  ...${modelWrapper}(${modelName}),`);
      } else {
        codes.push(`  ...${modelName},`);
      }
    } else {
      if (modelWrapper) {
        codes.push(`  ${modelWrapper}(${modelName}),`);
      } else {
        codes.push(`  ${modelName},`);
      }
    }
  }
  codes.push(`] as T${configurationTypeName}[];`);
  codes.push("");

  fs.writeFileSync(path.join(outputDir, indexFileName + ".ts"), codes.join("\n"));
}

export function generateModelIndexFiles(declarationsDirectory: string) {
  const modelsDir = path.join(declarationsDirectory, "models");
  const outputDir = path.join(declarationsDirectory, "meta");
  const typeDefFilePath = "@ruiapp/rapid-extension";

  ensureDirectoryExists(outputDir);

  generateEntityConfigIndexFile({
    modelsDir,
    outputDir,
    typeDefFilePath,
    configurationDirName: "entities",
    configurationTypeName: "RapidEntity",
    indexFileName: "entity-models",
    extraImports: [`import { autoConfigureRapidEntity } from '@ruiapp/rapid-extension';`],
    modelWrapper: "autoConfigureRapidEntity",
  });

  generateConfigIndexFile({
    modelsDir,
    outputDir,
    typeDefFilePath,
    configurationDirName: "data-dictionaries",
    configurationTypeName: "RapidDataDictionary",
    indexFileName: "data-dictionary-models",
  });
  generateConfigIndexFile({
    modelsDir,
    outputDir,
    typeDefFilePath,
    configurationDirName: "pages",
    configurationTypeName: "RapidPageLoader",
    indexFileName: "page-models",
  });

  generateConfigIndexFile({
    modelsDir,
    outputDir,
    typeDefFilePath: "@ruiapp/rapid-core",
    configurationDirName: "server-operations",
    configurationTypeName: "ServerOperation",
    indexFileName: "server-operations",
  });

  generateConfigIndexFile({
    modelsDir,
    outputDir,
    typeDefFilePath: "@ruiapp/rapid-core",
    configurationDirName: "entity-watchers",
    configurationTypeName: "EntityWatcherType",
    indexFileName: "entity-watchers",
    flattenModelArray: true,
  });

  generateConfigIndexFile({
    modelsDir,
    outputDir,
    typeDefFilePath: "@ruiapp/rapid-core",
    configurationDirName: "cron-jobs",
    configurationTypeName: "CronJobConfiguration",
    indexFileName: "cron-jobs",
    flattenModelArray: false,
  });
}

console.log("Generating meta index files...");
