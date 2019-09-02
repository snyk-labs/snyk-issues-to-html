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
      describe: "list of organization ids"
    }
  })
  .help("h")
  .alias("h", "help")
  .epilog("✨  Use Open Source, Stay Secure - https://snyk.io").argv;

let config = {};
if (commandOptions.config) {
  config = require(commandOptions.config);
}

console.log(commandOptions);
main({ token: commandOptions.token, filters: config.filters }).catch(err => {
  console.error(`Error: ${err.message}`);
  console.error();
  console.error("Oh no 😱");
  console.error(`We apologise for the inconvenience! `);
  console.error();
  console.error(`Please open an issue on: ${pkgInfo.bugs.url}`);
  console.error(`Or reach out to our team at support@snyk.io`);
});
