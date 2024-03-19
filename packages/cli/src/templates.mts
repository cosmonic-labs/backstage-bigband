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

/**
 * Perform termplating on the given set of paths.
 *
 * Paths that are provided to template are expected to end in '.hbs', and template outputs
 * will those suffixes stripped.
 *
 * @params {string} workspaceDir - path to the root of the workspace
 * @params {string[]} templatePaths - relative paths to the files to template
 * @params {Record<string, string>} templateData - data to be provided to the templates
 */
export async function templatePaths(workspaceDir: string, templatePaths: string[], templateData: Record<string, string>): Promise<void> {
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
}
