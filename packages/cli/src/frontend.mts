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

import { backstageFrontendPlugin } from "backstage:frontend-plugin";

interface ComponentFile {
  path: string,
  isRoot: boolean,
  componentName?: string,
  contents: string,
}

interface BackstageFrontendWasmModule {
  backstageFrontendPlugin: typeof backstageFrontendPlugin;
}

/**
 * Build a frontend backstage plugin
 *
 * @param {PluginBuildArgs}
 * @returns {Promise<PluginBuildResults>}
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
    )} Copying frontend template to workspace @ [${workspaceDir}]... `
  );
  const templatesPath = path.resolve(
    path.join(import.meta.dirname, "../templates/frontend-plugin")
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
  console.log(
    `${chalk.green("[success]")} Initial yarn install completed `
  );


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
  const wasmModule: BackstageFrontendWasmModule = await import(entrypointPath);
  console.log(
    `${chalk.green("[success]")} Import & initialization complete `
  );

  // Install all required dependencies noted by the WebAssembly module
  const deps = wasmModule.backstageFrontendPlugin.getNodeDeps();
  console.log(
    `${chalk.cyan("[info]")} Detected [${
      deps.length
    }] required dependencies from WebAssembly module... `
  );

  for (const dep of deps) {
    console.log(
      `${chalk.cyan("[info]")} Adding required dependency [${dep.name}]... `
    );
    const addArgs = [
      "add",
      dep.version ? `${dep.name}@${dep.version}` : dep.name,
    ];
    if (dep.dev) {
      addArgs.push("--save-dev");
    }
    await execa("yarn", addArgs, {
      cwd: workspaceDir,
    });
  }
  console.log(
    `${chalk.green("[success]")} Successfully installed required dependencies `
  );

  // Write frontend component file(s) content to disk
  const componentDir = path.join(workspaceDir, "src/components");
  const componentFiles = wasmModule.backstageFrontendPlugin.getComponentFiles();
  console.log(
    `${chalk.cyan("[info]")} Detected [${
      componentFiles.length
    }] component files from WebAssembly module ... `
  );
  await Promise.all(
    componentFiles.map(async (componentFile: ComponentFile) => {
      const { path: subPath, contents } = componentFile;
      // Determine the intended path to the component file
      const filePath = path.join(componentDir, subPath);
      // Ensure the path is present
      const dirPath = path.dirname(filePath);
      await fs.ensureDir(dirPath);
      console.log(
        `${chalk.cyan("[info]")} Writing out component file [${filePath}]`
      );
      // Write the contents of the file to disk
      await fs.writeFile(filePath, contents);
    })
  );
  console.log(
    `${chalk.green("[success]")} Successfully wrote out component files `
  );

  const rootComponentFiles = componentFiles.filter((v: ComponentFile) => v.isRoot);
  if (rootComponentFiles.length != 1) {
    console.log(
      `${chalk.red("[error]")} Found [${
        rootComponentFiles.length
      }] component files marked root`
    );
    throw new Error(
      `Found [${rootComponentFiles.length}] root component files (there should only be one)`
    );
  }
  const rootComponentFile = componentFiles[0];

  // Determine the root component name
  const rootComponentClassName = rootComponentFile.componentClassName;
  if (!rootComponentClassName) {
    console.log(
      `${chalk.red("[error]")} Root component name is unexpectedly missing`
    );
    throw new Error(
      `Root component (path [${rootComponentFile.path}]) is missing a Component name`
    );
  }

  // Determine the path to the root component file, starting from `src/components`
  const rootComponentSubPath = rootComponentFile.path;
  // Determine the absolute path to the root component file, starting from `src/components`
  const rootComponentPath = path.join(componentDir, rootComponentFile.path);

  // Pull together data needed for templating
  const templateData = {
    pluginRootComponentClassName: rootComponentClassName,
    pluginID,
    pluginObjectName: `${camelCase(pluginID)}Plugin`,
    pluginPageClassName: `${rootComponentClassName}Page`,
    rootComponentSubPath: rootComponentFile.path,
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

  // Perform templating on all files known to need it
  const templatePaths = [
    path.join(workspaceDir, "package.json.hbs"),
    path.join(workspaceDir, "dev/index.tsx.hbs"),
    path.join(workspaceDir, "src/plugin.ts.hbs"),
  ];
  console.log(
    `${chalk.cyan("[info]")} Performing handlebars templating on [${
      templatePaths.length
    }] files...`
  );
  await Promise.all(
    templatePaths.map(async (templatePath) => {
      // Get the filename of the templated file, replaced
      const postFilePath = path.basename(templatePath, ".hbs");

      // Create the directory for the rendered file
      const renderedOutputDir = path.dirname(templatePath);
      await fs.ensureDir(renderedOutputDir);

      // Write the file out to the directory it should be in from the workspace
      const renderedFilePath = path.join(renderedOutputDir, postFilePath);
      console.log(
        `${chalk.cyan(
          "[info]"
        )} Writing out templated file [${renderedFilePath}]`
      );
      await fs.writeFile(
        renderedFilePath,
        handlebars.compile((await fs.readFile(templatePath)).toString())(
          templateData
        )
      );

      console.log(
        `${chalk.cyan("[info]")} Cleaning up template file [${templatePath}]...`
      );
      await fs.remove(templatePath);
    })
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
  console.log(
    `${chalk.green("[success]")} Final yarn install completed `
  );

  return {
    workspaceDir,
    meta: {
      pluginRootComponentClassName: rootComponentClassName,
      pluginID,
      pluginObjectName: `${camelCase(pluginID)}Plugin`,
      pluginPageClassName: `${rootComponentClassName}Page`,
    },
  };
}

/**
 * Perform post-install setup & integration into a Backstage install,
 * after plugin has been installed.
 *
 */
export async function postInstallSetup(backstageDir: string, pluginID: string, pluginPackageName: string, pluginPageClassName: string): Promise<void>{
  // Update App.tsx to add Import and Route lines
  const appTsxPath = path.join(backstageDir, "packages/app/src/App.tsx");
  if (!(await fs.pathExists(appTsxPath))) {
    console.log(
      `${chalk.red(
"[error]"
)} App.tsx was not at expected location [${appTsxPath}]`
    );
    throw new Error(`App.tsx was not at expected location [${appTsxPath}]`);
  }

  console.log(
    `${chalk.cyan(
"[info]"
)} Modifying App.tsx with new plugin import & <Route />...`
  );
  const importLine = `import { ${pluginPageClassName} } from '${pluginPackageName}';`;
  const routeLine = `    <Route path="/${pluginID}" element={<${pluginPageClassName} />} />`;

  // ASSUMPTION: we expect that App.tsx will fit in memory
  const appTsxContents = await fs.readFile(appTsxPath);
  let updatedAppTsxContents = `${importLine}\n`;
  let insertedRoute = false;
  const appTsxText = appTsxContents.toString();

  // If both the import line and the route line are already present, we're done
  if (appTsxText.includes(importLine) && appTsxText.includes(routeLine)) {
    console.log(
      `${chalk.yellow("[warn]")} Found existing import lines in App.tsx, skipping... `
    );
    return;
  }

  // Go through the lines in appTsxText
  for (const line of appTsxText.split("\n")) {
    // Read until we find a line with "</FlatRoutes>"
    if (!insertedRoute && line.trim().includes("</FlatRoutes>")) {
      updatedAppTsxContents += routeLine + "\n";
      updatedAppTsxContents += line + "\n";
      insertedRoute = true;
      continue;
    }

    // If nothing matched then we can just add the line
    updatedAppTsxContents += line + "\n";
  }
  await fs.writeFile(appTsxPath, updatedAppTsxContents);
}
