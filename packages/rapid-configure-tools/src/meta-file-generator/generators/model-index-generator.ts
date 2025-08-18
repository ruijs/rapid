/**
 * 用于生成模型索引文件，将模型定义按照类型分别导出。
 */

import fs from "fs";
import { forEach } from "lodash";
import path from "path";
import { ensureDirectoryExists, enumFileBaseNamesInDirectory } from "@ruiapp/rapid-core";

interface GenerateModelsIndexFileOption {
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
   * The model category directory name.
   */
  categoryDirName: string;
  /**
   * The model type name in the `categoryDir`.
   */
  modelTypeName: string;

  modelsFileName: string;

  extraImports?: string[];

  modelWrapper?: string;

  flattenModelArray?: boolean;
}

function generateEntityModelIndexFilesOfTypeDir({
  modelsDir,
  outputDir,
  typeDefFilePath,
  categoryDirName,
  modelTypeName,
  modelsFileName,
  extraImports,
  modelWrapper,
  flattenModelArray,
}: GenerateModelsIndexFileOption) {
  const filesDir = path.join(modelsDir, categoryDirName);
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
  codes.push(`import type { ${modelTypeName} as T${modelTypeName} } from '${typeDefFilePath}';`);
  forEach(extraImports, (extraImport) => {
    codes.push(extraImport);
  });

  for (const model of models) {
    const { modelName, fileName } = model;
    if (fileName.includes(" ")) {
      continue;
    }
    codes.push(`import ${modelName} from '../models/${categoryDirName}/${fileName}';`);
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

  codes.push(`const configuredEntities:T${modelTypeName}[] = [`);

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

  fs.writeFileSync(path.join(outputDir, modelsFileName + ".ts"), codes.join("\n"));
}

function generateModelIndexFilesOfTypeDir({
  modelsDir,
  outputDir,
  typeDefFilePath,
  categoryDirName,
  modelTypeName,
  modelsFileName,
  extraImports,
  modelWrapper,
  flattenModelArray,
}: GenerateModelsIndexFileOption) {
  const filesDir = path.join(modelsDir, categoryDirName);
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
  codes.push(`import type { ${modelTypeName} as T${modelTypeName} } from '${typeDefFilePath}';`);
  forEach(extraImports, (extraImport) => {
    codes.push(extraImport);
  });

  for (const model of models) {
    const { modelName, fileName } = model;
    if (fileName.includes(" ")) {
      continue;
    }
    codes.push(`import ${modelName} from '../models/${categoryDirName}/${fileName}';`);
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
  codes.push(`] as T${modelTypeName}[];`);
  codes.push("");

  fs.writeFileSync(path.join(outputDir, modelsFileName + ".ts"), codes.join("\n"));
}

export function generateModelIndexFiles(declarationsDirectory: string) {
  const modelsDir = path.join(declarationsDirectory, "models");
  const outputDir = path.join(declarationsDirectory, "meta");
  const typeDefFilePath = "@ruiapp/rapid-extension";

  ensureDirectoryExists(outputDir);

  generateEntityModelIndexFilesOfTypeDir({
    modelsDir,
    outputDir,
    typeDefFilePath,
    categoryDirName: "entities",
    modelTypeName: "RapidEntity",
    modelsFileName: "entity-models",
    extraImports: [`import { autoConfigureRapidEntity } from '@ruiapp/rapid-extension';`],
    modelWrapper: "autoConfigureRapidEntity",
  });

  generateModelIndexFilesOfTypeDir({
    modelsDir,
    outputDir,
    typeDefFilePath,
    categoryDirName: "data-dictionaries",
    modelTypeName: "RapidDataDictionary",
    modelsFileName: "data-dictionary-models",
  });
  generateModelIndexFilesOfTypeDir({
    modelsDir,
    outputDir,
    typeDefFilePath,
    categoryDirName: "pages",
    modelTypeName: "RapidPageLoader",
    modelsFileName: "page-models",
  });

  generateModelIndexFilesOfTypeDir({
    modelsDir,
    outputDir,
    typeDefFilePath: "@ruiapp/rapid-core",
    categoryDirName: "server-operations",
    modelTypeName: "ServerOperation",
    modelsFileName: "server-operations",
  });

  generateModelIndexFilesOfTypeDir({
    modelsDir,
    outputDir,
    typeDefFilePath: "@ruiapp/rapid-core",
    categoryDirName: "entity-watchers",
    modelTypeName: "EntityWatcherType",
    modelsFileName: "entity-watchers",
    flattenModelArray: true,
  });

  generateModelIndexFilesOfTypeDir({
    modelsDir,
    outputDir,
    typeDefFilePath: "@ruiapp/rapid-core",
    categoryDirName: "cron-jobs",
    modelTypeName: "CronJobConfiguration",
    modelsFileName: "cron-jobs",
    flattenModelArray: false,
  });
}

console.log("Generating meta index files...");
