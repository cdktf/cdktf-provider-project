const { cdk } = require('projen');

const project = new cdk.JsiiProject({
  name: '@cdktf/provider-project',
  authorName: 'HashiCorp',
  authorUrl: 'https://hashicorp.com',
  repository: 'https://github.com/hashicorp/cdktf-provider-project.git',
  authorOrganization: true,
  peerDeps: [
    'projen@^0.31.12',
  ],
  deps: [
    'change-case',
  ],
  bundledDeps: [
    'change-case',
  ],
  license: 'MPL-2.0',
  defaultReleaseBranch: 'main',
  releaseToNpm: true,
  minNodeVersion: '12.19.0',
  compileBeforeTest: true,
  mergify: false,
  scripts: {
    'eslint:fix': 'eslint . --ext .ts --fix',
  },
});

project.addFields({ publishConfig: { access: 'public' } });
project.synth();