/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { cdk } from "projen";
import { UpgradeDependenciesSchedule } from "projen/lib/javascript";
import { UpgradeJSIIAndTypeScript } from "./projenrc/upgrade-jsii-typescript";
import { UpgradeNode } from "./projenrc/upgrade-node";
import { AutoApprove } from "./src/auto-approve";
import { Automerge } from "./src/automerge";
import { CustomizedLicense } from "./src/customized-license";
import { LockIssues } from "./src/lock-issues";
import { generateRandomCron, Schedule } from "./src/util/random-cron";

// Remember that this is the list used by this repo (cdktf-provider-project) ONLY.
// If you want to update actions versions for the individual prebuilt providers,
// you will need to update the map in src/index.ts
const githubActionPinnedVersions = {
  "actions/checkout": "11bd71901bbe5b1630ceea73d27597364c9af683", // v4.2.2
  "actions/download-artifact": "95815c38cf2ff2164869cbab79da8d1f422bc89e", // v4.2.1
  "actions/github-script": "60a0d83039c74a4aee543508d2ffcb1c3799cdea", // v7.0.1
  "actions/setup-node": "cdca7365b2dadb8aad0a33bc7601856ffabcc48e", // v4.3.0
  "actions/stale": "5bef64f19d7facfb25b37b414482c7164d639639", // v9.1.0
  "actions/upload-artifact": "ea165f8d65b6e75b540449e92b4886f43607fa02", // v4.6.2
  "amannn/action-semantic-pull-request":
    "0723387faaf9b38adef4775cd42cfd5155ed6017", // v5.5.3
  "dessant/lock-threads": "1bf7ec25051fe7c00bdd17e6a7cf3d7bfb7dc771", // v5.0.1
  "hashicorp/setup-copywrite": "32638da2d4e81d56a0764aa1547882fc4d209636", // v1.1.3
  "peter-evans/create-pull-request": "271a8d0340265f705b14b6d32b9829c1cb33d45e", // v7.0.8
};

/** JSII and TS should always use the same major/minor version range */
const typescriptVersion = "~5.8.0";
const project = new cdk.JsiiProject({
  name: "@cdktf/provider-project",
  author: "HashiCorp",
  authorAddress: "https://hashicorp.com",
  repositoryUrl: "https://github.com/cdktf/cdktf-provider-project.git",
  authorOrganization: true,
  licensed: false, // we do supply our own license file with a custom header
  pullRequestTemplate: false,
  typescriptVersion,
  jsiiVersion: typescriptVersion,
  peerDeps: ["projen@^0.87.4", "constructs@^10.4.2"],
  deps: ["change-case", "fs-extra"],
  bundledDeps: ["change-case", "fs-extra"],
  defaultReleaseBranch: "main",
  releaseToNpm: true,
  minNodeVersion: "20.9.0",
  mergify: false,
  prettier: true,
  scripts: {
    "eslint:fix": "eslint . --ext .ts --fix",
  },
  stale: false, // disabling for now but keeping the options below so we can turn it back on if desired
  staleOptions: {
    issues: {
      exemptLabels: ["backlog", "help wanted", "no-auto-close"],
      staleLabel: "stale",
      daysBeforeStale: 30,
      staleMessage:
        "Hi there! 👋 We haven't heard from you in 30 days and would like to know if the problem has been resolved or if " +
        "you still need help. If we don't hear from you before then, I'll auto-close this issue in 30 days.",
      daysBeforeClose: 30,
      closeMessage:
        "I'm closing this issue because we haven't heard back in 60 days. ⌛️ If you still need help, feel free to reopen the issue!",
    },
    pullRequest: {
      exemptLabels: ["backlog", "help wanted", "no-auto-close"],
      staleLabel: "stale",
      daysBeforeStale: 60,
      staleMessage:
        "Hi there! 👋 We haven't heard from you in 60 days and would like to know if you're still working on this or need help. " +
        "If we don't hear from you before then, I'll auto-close this PR in 30 days.",
      daysBeforeClose: 30,
      closeMessage:
        "I'm closing this pull request because we haven't heard back in 90 days. ⌛️ If you're still working on this, feel free to reopen the PR or create a new one!",
    },
  },
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ["automerge", "auto-approve", "dependencies"],
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  workflowGitIdentity: {
    name: "team-tf-cdk",
    email: "github-team-tf-cdk@hashicorp.com",
  },
  projenrcTs: true,
});

project.addDevDeps(
  "glob",
  "@types/glob",
  "@types/fs-extra",
  "@action-validator/core",
  "@action-validator/cli"
);

project.addFields({ publishConfig: { access: "public" } });

new CustomizedLicense(project, 2020);
new LockIssues(project);
new AutoApprove(project);
new Automerge(project);
new UpgradeJSIIAndTypeScript(project, typescriptVersion);
new UpgradeNode(project);

project.addPackageIgnore("projenrc");
project.addPackageIgnore("/.projenrc.ts");
project.addPackageIgnore(".copywrite.hcl");

// Make sure 'chore' tasks also show up in the changelog
// Changes in this repo can be quite consequential, so don't hide chores
project.addFields({
  "standard-version": {
    types: [
      {
        type: "feat",
        section: "Features",
      },
      {
        type: "fix",
        section: "Bug Fixes",
      },
      {
        type: "chore",
        section: "Updates",
      },
      {
        type: "docs",
        hidden: true,
      },
      {
        type: "style",
        hidden: true,
      },
      {
        type: "refactor",
        hidden: true,
      },
      {
        type: "perf",
        hidden: true,
      },
      {
        type: "test",
        hidden: true,
      },
    ],
  },
});

const validateTask = project.addTask("validate-workflows", {
  exec: `find ./.github/workflows -type f -name "*.yml" -print0 | xargs -0 -n 1 npx action-validator`,
});
validateTask.description =
  "Lint the YAML files generated by Projen to define GitHub Actions and Workflows, checking them against published JSON schemas";
project.postCompileTask.spawn(validateTask);

// Run copywrite tool to add copyright headers to all files
// This is for this repository itself, not for the projects
// using this Projen template
project.buildWorkflow?.addPostBuildSteps(
  {
    name: "Setup Copywrite tool",
    uses: "hashicorp/setup-copywrite",
  },
  { name: "Add headers using Copywrite tool", run: "copywrite headers" }
);

// Use pinned versions of github actions
Object.entries(githubActionPinnedVersions).forEach(([name, sha]) => {
  project.github?.actions.set(name, `${name}@${sha}`);
});

const releaseWorkflow = project.tryFindObjectFile(
  ".github/workflows/release.yml"
);
releaseWorkflow?.addOverride("on.push", {
  branches: ["main"],
  "paths-ignore": [
    // don't do a release if the change was only to these files/directories
    ".github/ISSUE_TEMPLATE/**",
    ".github/CODEOWNERS",
    ".github/dependabot.yml",
    ".github/**/*.md",
  ],
});

const staleWorkflow = project.tryFindObjectFile(".github/workflows/stale.yml");
staleWorkflow?.addOverride("on.schedule", [
  {
    cron: generateRandomCron({ project, maxHour: 4, hourOffset: 1 }),
  },
]);

const upgradeWorkflow = project.tryFindObjectFile(
  ".github/workflows/upgrade-main.yml"
);
upgradeWorkflow?.addOverride("on.schedule", [
  {
    cron: generateRandomCron({
      project,
      maxHour: 0,
      schedule: Schedule.Weekly,
    }),
  },
]);

project.synth();
