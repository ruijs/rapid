import fs from "fs";
import path from "path";
import type { RapidDataDictionary, RapidEntity, RapidField } from "@ruiapp/rapid-extension";

function generateDictionaryLocales(metaDir: string) {
  const dictionaries: RapidDataDictionary[] = require(path.join(metaDir, "data-dictionary-models")).default;

  const codes: string[] = [];

  const linguals: Set<string> = new Set();
  for (const dictionary of dictionaries) {
    if (dictionary.locales) {
      for (const locale of Object.keys(dictionary.locales)) {
        linguals.add(locale);
      }
    }
    for (const entry of dictionary.entries) {
      if (entry.locales) {
        for (const locale of Object.keys(entry.locales)) {
          linguals.add(locale);
        }
      }
    }
  }

  codes.push(`const dictionaryLocales: Record<string, {translation: Record<string, any>}> = {`);
  for (const lingual of linguals) {
    codes.push(`  "${lingual}": {`);
    codes.push(`    translation: {`);
    codes.push(`      dictionaries: {`);

    for (const dictionary of dictionaries) {
      const dictionaryLocale = dictionary.locales?.[lingual];
      codes.push(`        "${dictionary.code}": {`);
      if (dictionaryLocale) {
        codes.push(`          name: "${dictionaryLocale.name}",`);
        codes.push(`          description: "${dictionaryLocale.description}",`);
      }

      codes.push(`        entries: {`);
      for (const entry of dictionary.entries) {
        let entryLocaleName;
        let entryLocaleDescription;
        const entryLocale = entry.locales?.[lingual];
        if (entryLocale) {
          entryLocaleName = entryLocale.name || dictionaryLocale?.entries?.[entry.value]?.name;
          entryLocaleDescription = entryLocale.description || dictionaryLocale?.entries?.[entry.value]?.description;
        }

        if (entryLocaleName || entryLocaleDescription) {
          codes.push(`          "${entry.value}": {`);
          if (entryLocaleName) {
            codes.push(`            name: "${entryLocaleName}",`);
          }
          if (entryLocaleDescription) {
            codes.push(`            description: "${entryLocaleDescription}",`);
          }
          codes.push(`          },`);
        }
      }
      codes.push(`        },`);
      codes.push(`      },`);
    }

    codes.push(`      },`);
    codes.push(`    },`);
    codes.push(`  },`);
  }
  codes.push(`};`);

  codes.push(`export default dictionaryLocales;`);

  const fileName = path.join(metaDir, "data-dictionary-locales.ts");
  fs.writeFileSync(fileName, codes.join("\n"));
}

function generateEntityLocales(metaDir: string) {
  const entities: RapidEntity[] = require(path.join(metaDir, "entity-models")).default;

  const codes: string[] = [];

  const linguals: Set<string> = new Set();
  for (const entity of entities) {
    if (entity.locales) {
      for (const locale of Object.keys(entity.locales)) {
        linguals.add(locale);
      }
    }
    for (const field of entity.fields) {
      if (field.locales) {
        for (const locale of Object.keys(field.locales)) {
          linguals.add(locale);
        }
      }
    }
  }

  codes.push(`const entityLocales: Record<string, {translation: Record<string, any>}> = {`);
  for (const lingual of linguals) {
    codes.push(`  "${lingual}": {`);
    codes.push(`    translation: {`);
    codes.push(`      entities: {`);

    for (const entity of entities) {
      const entityLocale = entity.locales?.[lingual];
      codes.push(`      "${entity.code}": {`);
      if (entityLocale) {
        codes.push(`        name: "${entityLocale.name}",`);
        codes.push(`        description: "${entityLocale.description}",`);
      }

      codes.push(`        fields: {`);
      for (const field of entity.fields) {
        let fieldLocaleName;
        let fieldLocaleDescription;
        const fieldLocale = field.locales?.[lingual];
        if (fieldLocale) {
          fieldLocaleName = fieldLocale.name || entityLocale?.fields?.[field.code]?.name;
          fieldLocaleDescription = fieldLocale.description || entityLocale?.fields?.[field.code]?.description;
        }

        if (fieldLocaleName || fieldLocaleDescription) {
          codes.push(`          "${field.code}": {`);
          if (fieldLocaleName) {
            codes.push(`            name: "${fieldLocaleName}",`);
          }
          if (fieldLocaleDescription) {
            codes.push(`            description: "${fieldLocaleDescription}",`);
          }
          codes.push(`          },`);
        }
      }
      codes.push(`        },`);
      codes.push(`      },`);
    }

    codes.push(`      },`);
    codes.push(`    },`);
    codes.push(`  },`);
  }
  codes.push(`};`);

  codes.push(`export default entityLocales;`);

  const fileName = path.join(metaDir, "entity-locales.ts");
  fs.writeFileSync(fileName, codes.join("\n"));
}

export function generateSdRpdModelLocales(declarationsDirectory: string) {
  const metaDir = path.join(declarationsDirectory, "meta");

  generateDictionaryLocales(metaDir);
  generateEntityLocales(metaDir);
}
