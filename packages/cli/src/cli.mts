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

import * as frontendPlugin from "./frontend.mjs";
import * as backendPlugin from "./backend.mjs";

export interface PluginBuildArgs {
  workspaceDir: string;
  transpiledContentPath: string;
  meta: {
    pluginID: string;
  };
}

export interface PluginBuildResults {
  workspaceDir: string;
  meta: {
    pluginRootComponentClassName?: string;
    pluginID: string;
    pluginObjectName: string;
    pluginPageClassName?: string;
  };
}

/** Build the CLI program (`commander`-driven) */
export async function buildProgram(): Promise<Command> {
  const program = new Command();

  program
    .name("bigband")
    .description(
      "A CLI for generating Backstage plugins from WebAssembly binaries"
    )
    .version("0.1.0");

  program
    .command("generate")
    .description("Create a new backstage plugin from a WebAssembly binary")
    .requiredOption("--wasm-binary <path>", "Path to to the WebAssembly binary")
    .addOption(
      new Option("--plugin-type <string>", "Type of backstage plugin")
        .choices(["frontend", "backend"])
        .makeOptionMandatory()
    )
    .requiredOption("--plugin-id <string>", "Plugin ID (ex. 'your-plugin')")
    .option(
      "--output-dir <dir>",
      "Path to the directory that will hold the generated Backstage plugin",
      "output"
    )
    .option(
      "--backstage-dir <dir>",
      "Path to the directory that contains your backstage source code",
      import.meta.dirname
    )
    .action(async (opts, cmd) => {
      const { wasmBinary, outputDir, pluginType, pluginId, backstageDir } =
        opts;

      // Determine absolute path for wasm binary
      let wasmAbsPath = path.isAbsolute(wasmBinary)
        ? wasmBinary
        : path.resolve(wasmBinary);

      // Ensure the WebAssembly binary is present
      const wasmFileExists = await fs.pathExists(wasmAbsPath);
      if (!wasmFileExists) {
        console.log(
          `${chalk.red(
            "[error]"
          )} WebAssembly component @ [${wasmAbsPath}] is missing`
        );
        throw Error(`WebAssembly binary @ [${wasmAbsPath}] does not exist`);
      }

      // Determine absolute path for output dir, create it if it doesn't exist
      let outputDirAbsPath = path.isAbsolute(outputDir)
        ? outputDir
        : path.resolve(outputDir);
      await fs.ensureDir(outputDirAbsPath);

      // Load the WebAssembly bytes from disk
      console.log(
        `${chalk.cyan("[info]")} Reading WASM binary @ [${wasmAbsPath}] `
      );
      const wasmBytes = new Uint8Array(await fs.readFile(wasmAbsPath));
      console.log(
        `${chalk.green("[success]")} Successfully read WASM binary `
      );

      // Extract the WIT for the module
      const componentWIT = await jco.componentWit(wasmBytes);
      if (process.env.DEBUG) {
        console.log(
          `${chalk.magenta("[debug]")} Component WIT:\n${componentWIT} `
        );
      }

      // Transpile WebAssembly module
      console.log(`${chalk.cyan("[info]")} Transpiling WASM binary into JS...`);
      const transpiled = await jco.transpile(wasmBytes, {
        name: "component",
        // Only backend plugins need the Top Level Await compatibility hack
        // since the environment inside Backstage is bit more restrictive build-wise.
        // (in particular, esbuild doesn't support some top level await w/ `cjs` output)
        tlaCompat: pluginType === 'backend',
      });
      console.log(
        `${chalk.green("[success]")} Successfully transpiled WASM binary `
      );

      // Create a temporary directory to hold the transpiled contents and the
      // Backstage plugin we will build
      const tmpWorkspace = await fs.mkdtemp(
        path.join(os.tmpdir(), "bigband-workspace-")
      );
      if (process.env.DEBUG) {
        console.log(
          `${chalk.magenta("[debug]")} Using temp workspace [${tmpWorkspace}] `
        );
      }

      // Create a path for the transpiled content to be written to, inside
      // the resulting workspace
      const transpiledContentPath = path.join(
        tmpWorkspace,
        "/src/wasm/transpiled"
      );
      await fs.mkdir(transpiledContentPath, { recursive: true });

      // Write output of all transpiled files to the output directory
      console.log(`${chalk.cyan("[info]")} Writing out transpiled JS...`);
      await Promise.all(
        Object.entries(transpiled.files).map(async ([filename, contents]) => {
          const dirPath = path.join(
            transpiledContentPath,
            path.dirname(filename)
          );
          await fs.mkdir(dirPath, {
            recursive: true,
          });
          const filePath = path.join(transpiledContentPath, filename);
          await fs.writeFile(filePath, contents);
        })
      );

      // Finish building the plugin
      let pluginBuildResults: PluginBuildResults;
      switch (pluginType) {
        case "frontend":
          pluginBuildResults = await frontendPlugin.build({
            workspaceDir: tmpWorkspace,
            transpiledContentPath,
            meta: {
              pluginID: pluginId,
            },
          });
          break;
        case "backend":
          pluginBuildResults = await backendPlugin.build({
            workspaceDir: tmpWorkspace,
            transpiledContentPath,
            meta: {
              pluginID: pluginId,
            },
          });
          break;
        default:
          throw new Error(`Unrecognized plugin type [${pluginType}]`);
      }

      // Extract information from build results
      const {
        workspaceDir,
        meta: { pluginID, pluginPageClassName },
      } = pluginBuildResults;

      // Determine the output path of the built plugin
      const pluginOutputDir = path.join(backstageDir, "plugins", pluginID);

      // Remove any existing directory that the plugin occupied previously
      if (await fs.pathExists(pluginOutputDir)) {
        console.log(
          `${chalk.yellow(
            "[warn]"
          )} Detected existing content plugin output directory [${pluginOutputDir}], removing...`
        );
        await fs.remove(pluginOutputDir);
      }

      // At this point the workspaceDir should contain a properly built
      // Backstage plugin, so we can copy it in
      console.log(
        `${chalk.cyan(
          "[info]"
        )} Copying plugin workspace into backstage source dir @ [${backstageDir}]...`
      );
      await fs.copy(workspaceDir, path.join(backstageDir, "plugins", pluginID));

      console.log(
        `${chalk.cyan(
          "[info]"
        )} Cleaning up workspace dir @ [${workspaceDir}]...`
      );
      await fs.remove(workspaceDir);

      const pluginPackageName = `@internal/plugin-${pluginID}`;

      // Perform post install setup, depending on which kind of module we build
      switch (pluginType) {
        case 'backend':
          await backendPlugin.postInstallSetup(backstageDir, pluginID, pluginPackageName);
          break;
        case 'frontend':
          if (!pluginPageClassName) {
            throw new Error("Failed to generate plugin page class name for frontend plugin");
          }
          await frontendPlugin.postInstallSetup(backstageDir, pluginID, pluginPackageName, pluginPageClassName);
          break;
        default:
          throw new Error(`Unrecognized plugin type [${pluginType}]`);
      }

      // Update package.json of the backstage project to require plugin name (@internal/${pluginID})
      const packageJsonPath = path.join(
        backstageDir,
        "packages/app/package.json"
      );
      if (!(await fs.pathExists(packageJsonPath))) {
        console.log(
          `${chalk.red(
            "[error]"
          )} package.json was not at expected location [${packageJsonPath}]`
        );
        throw new Error(
          `package.json was not at expected location [${packageJsonPath}]`
        );
      }
      let packageJson = loadPackageJson({ filepath: packageJsonPath });
      packageJson.requireDependency({
        pkg: pluginPackageName,
        version: "*",
        field: "dependencies",
      });
      packageJson.writeChanges();

      // Run yarn install at the backstage level
      console.log(
        `${chalk.cyan(
          "[info]"
        )} Performing backstage-level yarn install (this may take a while)... `
      );
      const { stdout: backstageInstallStdout } = await execa(
        "yarn",
        ["install"],
        {
          cwd: backstageDir,
        }
      );
      if (process.env.DEBUG) {
        console.log(
          `${chalk.magenta(
            "[debug]"
          )} backstage yarn install output:\n${backstageInstallStdout} `
        );
      }
    });

  return program;
}
