# Terraform CDK Provider Project

A project template for [project](https://github.com/eladb/projen) to create repositories for prebuilt provider packages for [Terraform CDK](https://cdk.tf).

## Usage

### Creating a new provider

In the repository where it's going to be used, all we need is a `.projenrc.js` file like this:

```js
const { CdktfProviderProject } = require('@cdktf/provider-project');
const { Semver } = require('projen');

const project = new CdktfProviderProject({
  terraformProvider: "aws@~> 2.0"
});

project.synth();
```

Adjust the `terraformProvider` attribute as required and run the following commands:

```
npm install @cdktf/provider-project@latest
npx projen
yarn install
```

This will generate an entire repository ready to be published, including Github Workflows for publishing NPM and Pypi packages. The only thing which is needed to be set manually are the tokens for these registries:

- `NPM_TOKEN`
- `TWINE_PASSWORD`
- `TWINE_USERNAME`

### Updating an existing Provider

Commit and push the required changes to this repository here and wait for the auto-release to happen. Once released, you can run the following commands in the target provider repository:

```
npm install @cdktf/provider-project@latest
npx projen
yarn install
```

Commit, push and check for the auto-released version.

## Development

Whatever needs to be changed in the downstream [provider repositories](https://github.com/terraform-cdk-providers/repository-manager) should be done via the [code definitions](./src/index.ts) here.

For local development, [yarn link](https://classic.yarnpkg.com/en/docs/cli/link/) might be quite helpful for testing.