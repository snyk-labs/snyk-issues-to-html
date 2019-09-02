"use strict";

const yargs = require("yargs");

const main = require("../index");
const pkgInfo = require("../package.json");

const commandOptions = yargs
  .usage("Usage: $0 [options]")
  .example("$0 --config config.json")
  .alias("t", "token")
  .describe("t", "Snyk API token")
  .alias("c", "config")
  .describe("c", "configuration file for export settings")
  .help("h")
  .alias("h", "help")
  .epilog("✨  Use Open Source, Stay Secure - https://snyk.io").argv;

let config = {};
if (commandOptions.config) {
  config = require(commandOptions.config);
}

main({ token: commandOptions.token, filters: config.filters }).catch(err => {
  console.error(`Error: ${err.message}`);
  console.error();
  console.error("Oh no 😱");
  console.error(`We apologise for the inconvenience! `);
  console.error();
  console.error(`Please open an issue on: ${pkgInfo.bugs.url}`);
  console.error(`Or reach out to our team at support@snyk.io`);
});
