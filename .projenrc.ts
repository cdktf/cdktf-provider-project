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
  "actions/checkout": "8ade135a41bc03ea155e62e844d188df1ea18608", // v4.1.0
  "actions/download-artifact": "9bc31d5ccc31df68ecc42ccf4149144866c47d8a", // v3.0.2
  "actions/github-script": "d7906e4ad0b1822421a7e6a35d5ca353c962f410", // v6.4.1
  "actions/setup-node": "5e21ff4d9bc1a8cf6de233a3057d20ec6b3fb69d", // v3.8.1
  "actions/upload-artifact": "a8a3f3ad30e3422c9c7b888a15615d19a852ae32", // v3.1.3
  "amannn/action-semantic-pull-request":
    "47b15d52c5c30e94a17ec87eb8dd51ff5221fed9", // v5.3.0
  "dessant/lock-threads": "be8aa5be94131386884a6da4189effda9b14aa21", // v4.0.1
  "peter-evans/create-pull-request": "153407881ec5c347639a548ade7d8ad1d6740e38", // v5.0.2
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
    "node-fetch@~2", // @TODO this can be removed once we upgrade to Node 18 and use native fetch
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
