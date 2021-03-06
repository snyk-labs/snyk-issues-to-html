"use strict";

const fs = require("fs");
const { Client } = require("../snyk-api-client/dist/src/index");
const hbs = require("handlebars");
const moment = require("moment");

const TEMPLATE_CSS = "./template/test-report.inline-css.hbs";
const TEMPLATE_ISSUE_CARD = "./template/test-report.issue-card.hbs";
const TEMPLATE_LAYOUT = "./template/test-report.hbs";

module.exports = async function main({ orgs, token, filters }) {
  composeTemplatePartials();

  const issuesTemplateFile = fs.readFileSync(TEMPLATE_LAYOUT, "utf-8");
  const issuesTemplate = hbs.compile(issuesTemplateFile);
  const templateData = await composeDataForTemplate({ orgs, token, filters });
  const html = issuesTemplate(templateData);

  fs.writeFileSync("snyk-reported-issues.html", html);
};

function composeTemplatePartials() {
  const cssFile = fs.readFileSync(TEMPLATE_CSS, "utf-8");
  const cssPartial = hbs.compile(cssFile);

  const issueCardFile = fs.readFileSync(TEMPLATE_ISSUE_CARD, "utf-8");
  const issueCardPartial = hbs.compile(issueCardFile);

  hbs.registerPartial("inline-css", cssPartial);
  hbs.registerPartial("issue-card", issueCardPartial);

  hbs.registerHelper("moment", (date, format) =>
    moment.utc(date).format(format)
  );
}

async function composeDataForTemplate({ orgs, token, filters }) {
  const data = await getIssues({ orgs, token, filters });

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

  return templateData;
}

async function getIssues({ orgs, token, filters }) {
  const defaultFilters = {
    date: {
      from: moment()
        .subtract(90, "days")
        .format("YYYY-MM-DD"),
      to: moment().format("YYYY-MM-DD")
    },
    orgs: orgs,
    severity: ["high", "medium", "low"],
    types: ["vuln", "license"],
    languages: [
      "javascript",
      "ruby",
      "java",
      "scala",
      "python",
      "golang",
      "php",
      "dotnet",
      "linux"
    ],
    ignored: false,
    patched: false,
    isFixed: false
  };

  const snykClient = new Client({
    token: token || process.env.SNYK_TOKEN
  });

  const issuesFilters = filters || defaultFilters;

  const res = await snykClient.issues.getAll({ filters: issuesFilters });
  return res;
}
