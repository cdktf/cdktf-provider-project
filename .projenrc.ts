import { cdk } from "projen";
import { CustomizedLicense } from "./src/customized-license";
import { LockIssues } from "./src/lock-issues";

const project = new cdk.JsiiProject({
  name: "@cdktf/provider-project",
  author: "HashiCorp",
  authorAddress: "https://hashicorp.com",
  repositoryUrl: "https://github.com/hashicorp/cdktf-provider-project.git",
  authorOrganization: true,
  licensed: false, // we do supply our own license file with a custom header
  peerDeps: ["projen@^0.67.64"],
  deps: ["change-case", "fs-extra"],
  devDeps: ["@types/fs-extra", "glob"],
  bundledDeps: ["change-case", "fs-extra"],
  license: "MPL-2.0",
  defaultReleaseBranch: "main",
  releaseToNpm: true,
  minNodeVersion: "14.17.0",
  mergify: false,
  scripts: {
    "eslint:fix": "eslint . --ext .ts --fix",
  },
  prettier: true,
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ["dependencies"],
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

// Run copywrite tool to add copyright headers to all files
// This is for this repository itself, not for the projects
// using this Projen template
project.buildWorkflow?.addPostBuildSteps(
  {
    name: "Setup Copywrite tool",
    uses: "hashicorp/setup-copywrite@3ace06ad72e6ec679ea8572457b17dbc3960b8ce", // v1.0.0
    with: { token: "${{ secrets.GITHUB_TOKEN }}" },
  },
  { name: "Add headers using Copywrite tool", run: "copywrite headers" }
);

project.synth();
