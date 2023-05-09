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
  peerDeps: ["projen@^0.71.46"],
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

project.synth();
