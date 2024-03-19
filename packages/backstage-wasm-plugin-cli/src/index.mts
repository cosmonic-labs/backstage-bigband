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

import { buildProgram } from "./cli.mjs";

// The imports below are generated externally via `jco` (see tsconfig.json)
import { backstageFrontendPlugin } from "backstage:frontend-plugin";
import { backstageBackendPlugin } from "backstage:backend-plugin";

interface BackstageFrontendWasmModule {
  backstageFrontendPlugin: typeof backstageFrontendPlugin;
}

interface BackstageBackendWasmModule {
  backstageBackendPlugin: typeof backstageBackendPlugin;
}

function main() {
  buildProgram().then((program) => program.parse());
}

process.on("unhandledRejection", (err) => {
  if (err instanceof Error) {
    process.stderr.write(
      `${chalk.red("[error]")} Unexpected Error (unhandled rejection): ${
        err.message
      }\n`
    );
  } else {
    process.stderr.write(
      `${chalk.red("[error]")} Unexpected Unknown error: ${err}\n`
    );
  }
});

main();
