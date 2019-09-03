"use strict";

const yargs = require("yargs");

const main = require("../index");
const pkgInfo = require("../package.json");

const commandOptions = yargs
  .usage("Usage: $0 [options]")
  .example("$0 --config config.json")
  .options({
    t: {
      alias: ["token"],
      type: "string",
      describe: "Snyk API token"
    },
    c: {
      alias: ["config"],
      type: "string",
      describe: "configuration file for export settings"
    },
    o: {
      alias: ["orgs"],
      type: "array",
      describe: "list of organization ids",
      conflicts: ["config", "c"]
    }
  })
  .help("h")
  .alias("h", "help")
  .epilog("✨  Use Open Source, Stay Secure - https://snyk.io")
  .check(function(argv) {
    if (!process.env.SNYK_TOKEN && !argv.token) {
      return "Error: a token must be provided via optional arguments or the SNYK_TOKEN environment variable";
    }

    if (!argv.orgs && !argv.config) {
      return "Error: one of --orgs or --config optional arguments must be provided";
    }

    return true;
  }).argv;

let config = {};
let orgs = null;
if (commandOptions.config) {
  config = require(commandOptions.config);
  orgs = config.filters.orgs;
} else {
  orgs = commandOptions.orgs;
}

main({
  orgs: orgs,
  token: commandOptions.token,
  filters: config.filters
}).catch(err => {
  console.error(`Error: ${err.message}`);
  console.error();
  console.error("Oh no 😱");
  console.error(`We apologise for the inconvenience! `);
  console.error();
  console.error(`Please open an issue on: ${pkgInfo.bugs.url}`);
  console.error(`Or reach out to our team at support@snyk.io`);
});
