import chokidar from 'chokidar';

import { MetaFileGenerator } from "@ruiapp/rapid-configure-tools";
import type { FileGenerateOption } from "@ruiapp/rapid-configure-tools";
import path from 'path';


export function runGenerator(options: FileGenerateOption) {
  const { declarationsDirectory } = options;
  const watcher = chokidar.watch(path.join(declarationsDirectory, 'models'), {
    // eslint-disable-next-line no-useless-escape
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });

  let initialized = false;

  let expanding = false;
  let postoned = false;

  const fileGenerator = new MetaFileGenerator()

  function tryGenerate () {
    if (expanding) {
      postoned = true;
      return;
    }

    fileGenerator.generateFiles(options);
    if (postoned) {
      fileGenerator.generateFiles(options);
    }

    expanding = false;
  }
  tryGenerate();

  watcher
    .on('all', () => {
      if (initialized) {
        tryGenerate();
      }
    })
    .on('ready', () => {
      tryGenerate();
      initialized = true;
    });
}

runGenerator({
  declarationsDirectory: path.join(process.cwd(), 'app', '_definitions'),
});