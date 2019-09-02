const fs = require("fs");
const { Client, Errors } = require("../snyk-api/dist/index");
const config = {
  api: process.env.SNYK_TOKEN
};
const hbs = require("handlebars");
const moment = require("moment");

const snykClient = new Client({
  token: config.api
});

async function getIssues() {
  const filters = {
    date: {
      from: "2019-01-01",
      to: "2019-10-01"
    },
    orgs: ["a30b7399-4e0c-4f6e-ba84-b27e131db54c"],
    severity: ["high", "medium", "low"],
    types: ["vuln", "license"],
    languages: [
      "node",
      "ruby",
      "java",
      "scala",
      "python",
      "golang",
      "php",
      "dotnet"
    ],
    ignored: false,
    patched: false,
    fixable: false,
    isFixed: false,
    isUpgradable: false,
    isPatchable: false
  };

  const res = await snykClient.issues.getAll({ filters });
  return res;
}

async function main() {
  const data = await getIssues();

  const cssFile = fs.readFileSync(
    "./template/test-report.inline-css.hbs",
    "utf-8"
  );
  const cssPartial = hbs.compile(cssFile);

  const issueCardFile = fs.readFileSync(
    "./template/test-report.issue-card.hbs",
    "utf-8"
  );
  const issueCardPartial = hbs.compile(issueCardFile);

  hbs.registerPartial("inline-css", cssPartial);
  hbs.registerPartial("issue-card", issueCardPartial);

  hbs.registerHelper("moment", (date, format) =>
    moment.utc(date).format(format)
  );

  const issuesTemplateFile = fs.readFileSync(
    "./template/test-report.hbs",
    "utf-8"
  );

  const issuesTemplate = hbs.compile(issuesTemplateFile);

  let issues = {};
  let issuesUniqueCount = 0;
  let projectsUniqueCount = 0;
  let projectsAffected = {};
  data.forEach((item, index) => {
    const issue = item.issue;
    const project = item.project;

    if (!issues[issue.id]) {
      issues[issue.id] = {};
      issues[issue.id]["issue"] = issue;
      issues[issue.id]["isFixed"] = item.isFixed;
      issues[issue.id]["introducedDate"] = item.introducedDate;
      issues[issue.id]["projects"] = {
        count: 1,
        data: [project]
      };
    } else {
      issues[issue.id]["projects"].count++;
      issues[issue.id]["projects"]["data"].push(project);
    }

    if (!projectsAffected[project.id]) {
      projectsUniqueCount++;
      projectsAffected[project.id] = project;
    }

    issuesUniqueCount++;
  });

  const templateData = {
    issues: issues,
    issuesUniqueCount: issuesUniqueCount,
    projectsUniqueCount: projectsUniqueCount
  };

  const html = issuesTemplate(templateData);
  fs.writeFileSync("output.html", html);
}

main().catch(err => {
  console.error(err);
});
