const { cdk } = require("projen");

const project = new cdk.JsiiProject({
  name: "@cdktf/provider-project",
  authorName: "HashiCorp",
  authorUrl: "https://hashicorp.com",
  repository: "https://github.com/hashicorp/cdktf-provider-project.git",
  authorOrganization: true,
  peerDeps: ["projen@^0.50.30"],
  deps: ["change-case"],
  devDeps: ["fs-extra", "@types/fs-extra", "glob"],
  bundledDeps: ["change-case"],
  license: "MPL-2.0",
  defaultReleaseBranch: "main",
  releaseToNpm: true,
  minNodeVersion: "14.17.0",
  compileBeforeTest: true,
  mergify: false,
  scripts: {
    "eslint:fix": "eslint . --ext .ts --fix",
  },
  prettier: true,
});

project.addFields({ publishConfig: { access: "public" } });
project.synth();
