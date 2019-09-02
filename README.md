[![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)](https://snyk.io)

---

# Snyk Reported Issues to HTML export

This command line utility uses the Snyk API to export the list of all reported issues for an organization to a static HTML page.

# How do I use it?

## Install or clone

First, Install the Snyk JSON to HTML Mapper using npm:

`npm install snyk-issues-to-html -g`

Alternatively, you can skip this step, clone this repository and run the script locally (using `node ./bin/cli.js`)

## Generate the HTML report

### Get an API Token

You will need the following information to access the API:

1. A Snyk account with an API access enabled
2. The Snyk API token

Make the token available via the `SNYK_TOKEN` environment variable, or pass it as an option to the CLI via the `--token "12345"` command option.

### Export a report

The following will export a default filtering of reported issues for the organization associated with this API token:

```
snyk-issues-to-html --token "1234"
```

### Customizing the issues filter

Create a JSON configuration file in the following format with your own customization for the filters:

filename: snyk-issues-filters.json

```json
{
  "filters": {
    "date": {
      "from": "2019-01-01",
      "to": "2019-10-01"
    },
    "orgs": ["a-b-c-d-e"],
    "severity": ["high", "medium", "low"],
    "types": ["vuln", "license"],
    "languages": [
      "node",
      "ruby",
      "java",
      "scala",
      "python",
      "golang",
      "php",
      "dotnet"
    ],
    "ignored": false,
    "patched": false,
    "fixable": false,
    "isFixed": false,
    "isUpgradable": false,
    "isPatchable": false
  }
}
```

and export it:

```
snyk-issues-to-html --token "1234" --config snyk-issues-filters.json
```

## View the HTML report

Simply open your new file (`snyk-reported-issues.html` above) in a browser, and rejoice.

### License

[License: Apache License, Version 2.0](LICENSE)
