/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { cdk } from "projen";
import { UpgradeDependenciesSchedule } from "projen/lib/javascript";
import { AutoApprove } from "./projenrc/auto-approve";
import { Automerge } from "./projenrc/automerge";
import { UpgradeNode } from "./projenrc/upgrade-node";
import { CustomizedLicense } from "./src/customized-license";
import { LockIssues } from "./src/lock-issues";

const githubActionPinnedVersions = {
  "actions/checkout": "c85c95e3d7251135ab7dc9ce3241c5835cc595a9", // v3.5.3
  "actions/download-artifact": "9bc31d5ccc31df68ecc42ccf4149144866c47d8a", // v3.0.2
  "actions/github-script": "d7906e4ad0b1822421a7e6a35d5ca353c962f410", // v6.4.1
  "actions/setup-node": "64ed1c7eab4cce3362f8c340dee64e5eaeef8f7c", // v3.6.0
  "actions/upload-artifact": "0b7f8abb1508181956e8e162db84b466c27e18ce", // v3.1.2
  "amannn/action-semantic-pull-request":
    "c3cd5d1ea3580753008872425915e343e351ab54", // v5.2.0
  "dessant/lock-threads": "c1b35aecc5cdb1a34539d14196df55838bb2f836", // v4.0.0
  "peter-evans/create-pull-request": "284f54f989303d2699d373481a0cfa13ad5a6666", // v5.0.1
};

const project = new cdk.JsiiProject({
  name: "@cdktf/provider-project",
  author: "HashiCorp",
  authorAddress: "https://hashicorp.com",
  repositoryUrl: "https://github.com/cdktf/cdktf-provider-project.git",
  authorOrganization: true,
  licensed: false, // we do supply our own license file with a custom header
  peerDeps: ["projen@^0.71.46"],
  deps: ["change-case", "fs-extra"],
  devDeps: [
    "@types/fs-extra",
    "glob",
    "node-fetch", // @TODO this can be removed once we upgrade to Node 18 and use native fetch
  ],
  bundledDeps: ["change-case", "fs-extra"],
  license: "MPL-2.0",
  defaultReleaseBranch: "main",
  releaseToNpm: true,
  minNodeVersion: "16.14.0",
  mergify: false,
  scripts: {
    "eslint:fix": "eslint . --ext .ts --fix",
  },
  prettier: true,
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ["dependencies"],
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  workflowGitIdentity: {
    name: "team-tf-cdk",
    email: "github-team-tf-cdk@hashicorp.com",
  },
  projenrcTs: true,
});

project.addFields({ publishConfig: { access: "public" } });

new CustomizedLicense(project, 2020);
new LockIssues(project);
new AutoApprove(project);
new Automerge(project);
new UpgradeNode(project);

// Run copywrite tool to add copyright headers to all files
// This is for this repository itself, not for the projects
// using this Projen template
project.buildWorkflow?.addPostBuildSteps(
  {
    name: "Setup Copywrite tool",
    uses: "hashicorp/setup-copywrite@867a1a2a064a0626db322392806428f7dc59cb3e", // v1.1.2
  },
  { name: "Add headers using Copywrite tool", run: "copywrite headers" }
);

// Use pinned versions of github actions
Object.entries(githubActionPinnedVersions).forEach(([name, sha]) => {
  project.github?.actions.set(name, `${name}@${sha}`);
});

project.synth();
