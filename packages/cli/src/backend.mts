import * as path from "node:path";
import * as os from "node:os";

import fs from "fs-extra";
import { Command, Option } from "commander";
import { camelCase } from "change-case";
import { default as chalk } from "chalk";
import * as jco from "@bytecodealliance/jco";
import { execa } from "execa";
import { default as handlebars } from "handlebars";
import { default as loadPackageJson } from "@financial-times/package-json";

import type { PluginBuildArgs, PluginBuildResults } from "./cli.mjs";
import { templatePaths } from "./templates.mjs";

import { backstageBackendPlugin } from "backstage:backend-plugin";

const BACKEND_ABOVE_PHRASE = "// Add backends ABOVE this line";

interface BackstageBackendWasmModule {
  backstageBackendPlugin: typeof backstageBackendPlugin;
}

/**
 * Build a backend backstage plugin
 *
 * @param {PluginBuildArgs}
 */
export async function build(
  args: PluginBuildArgs
): Promise<PluginBuildResults> {
  const {
    workspaceDir,
    transpiledContentPath,
    meta: { pluginID },
  } = args;

  // Stamp out copy of template NodeJS project
  // this is an initial base template, no replacements yet
  console.log(
    `${chalk.cyan(
      "[info]"
    )} Copying backend template to workspace @ [${workspaceDir}]... `
  );
  const templatesPath = path.resolve(
    path.join(import.meta.dirname, "../templates/backend-plugin")
  );
  await fs.copy(templatesPath, workspaceDir);

  // Perform an initial `yarn install` of the project
  console.log(
    `${chalk.cyan(
      "[info]"
    )} Performing initial plugin yarn install (this may take a while)... `
  );
  const { stdout: initialInstallStdout } = await execa("yarn", ["install"], {
    cwd: workspaceDir,
  });
  if (process.env.DEBUG) {
    console.log(
      `${chalk.magenta(
        "[debug]"
      )} initial yarn install output:\n${initialInstallStdout} `
    );
  }

  // Load the JS-transpiled WebAssembly component
  const jsEntrypointPath = path.join(transpiledContentPath, "component.js");
  let entrypointPath = jsEntrypointPath;
  const mjsEntrypointPath = path.join(transpiledContentPath, "component.mjs");
  if (await fs.pathExists(jsEntrypointPath)) {
    await fs.move(jsEntrypointPath, mjsEntrypointPath);
    entrypointPath = mjsEntrypointPath;
  }
  console.log(
    `${chalk.cyan("[info]")} Importing transpiled JS @ [${entrypointPath}]...`
  );

  const wasmModule: BackstageBackendWasmModule = await import(entrypointPath);


  // Pull together data needed for templating
  const templateData = {
    pluginID,
    pluginObjectName: `${camelCase(pluginID)}Plugin`,
  };
  if (process.env.DEBUG) {
    console.log(
      `${chalk.magenta("[debug]")} Generated template data:\n${JSON.stringify(
        templateData,
        null,
        2
      )} `
    );
  }

  // Perform templating
  await templatePaths(
    workspaceDir,
    [
      path.join(workspaceDir, "package.json.hbs"),
      path.join(workspaceDir, "src/service/router.ts.hbs"),
    ],
    templateData,
  );
  console.log(
    `${chalk.green("[success]")} Templating complete `
  );

  // Perform an final `yarn install` of the plugin project
  console.log(
    `${chalk.cyan(
      "[info]"
    )} Performing final plugin dir yarn install (this may take a while)... `
  );
  const { stdout: finalInstallStdout } = await execa("yarn", ["install"], {
    cwd: workspaceDir,
  });
  if (process.env.DEBUG) {
    console.log(
      `${chalk.magenta(
        "[debug]"
      )} final yarn install output:\n${finalInstallStdout} `
    );
  }

  return {
    workspaceDir,
    meta: {
      pluginID,
      pluginObjectName: `${camelCase(pluginID)}Plugin`,
    },
  };
}


/**
 * Perform post-install setup & integration into a Backstage install,
 * after plugin has been installed.
 *
 */
export async function postInstallSetup(backstageDir: string, pluginID: string, pluginPackageName: string, ): Promise<void>{

  // Write out the plugin integration file, if necessary.
  //
  // This file goes into Backstage backend code but references the plugin that should
  // have been built.
  const pluginIntegrationFilePath = path.join(backstageDir, `packages/backend/src/plugins/${pluginID}.ts`);
  if (!(await fs.pathExists(pluginIntegrationFilePath))) {
    console.log(
      `${chalk.cyan("[info]")} creating plugin integration file @ [${pluginIntegrationFilePath}] `
    );
    const pluginIntegrationContents = `
import { createRouter } from '@internal/plugin-${pluginID}';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
env: PluginEnvironment,
): Promise<Router> {
return await createRouter({
logger: env.logger,
});
}
`;
    await fs.writeFile(pluginIntegrationFilePath, pluginIntegrationContents);
  }
    console.log(
      `${chalk.green("[success]")} placed plugin integration file @ ${pluginIntegrationFilePath} `
    );

  const pluginIDCamel = camelCase(pluginID);
  const importLine = `import ${pluginIDCamel} from './plugins/${pluginID}';`;
  const routerLine = `  apiRouter.use('/${pluginID}', await ${pluginIDCamel}(useHotMemoize(module, () => createEnv('${pluginID}'))));`;

  // Update backend/src/index.ts to include our custom backend
  // ASSUMPTION: we expect that backend/src/index.ts will fit in memory
  const backendIndexPath = path.join(backstageDir, "packages/backend/src/index.ts");
  const backendIndexContents = await fs.readFile(backendIndexPath);
  let updatedBackendIndexContents = `${importLine}\n`;
  let insertedRoute = false;
  const backendIndexText = backendIndexContents.toString();

  // If the plugin is already imported and hooked up, we can quit
  if (backendIndexText.includes(importLine) && backendIndexText.includes(routerLine)) {
    console.log(
      `${chalk.yellow("[warn]")} Found existing import & route setup in backend, skipping... `
    );
    return;
  }

  // Go through the lines in backendIndexText
  for (const line of backendIndexText.split("\n")) {

    // Read until we find a line with "</FlatRoutes>"
    if (!insertedRoute && line.trim().includes(BACKEND_ABOVE_PHRASE)) {
      updatedBackendIndexContents += routerLine + "\n";
      updatedBackendIndexContents += line + "\n";
      insertedRoute = true;
      continue;
    }

    // If nothing matched then we can just add the line
    updatedBackendIndexContents += line + "\n";
  }
  await fs.writeFile(backendIndexPath, updatedBackendIndexContents);
}
