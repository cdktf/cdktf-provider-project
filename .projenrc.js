const { TypeScriptProject } = require('projen');
const version = require('projen/version.json');

const project = new TypeScriptProject({
  name: '@cdktf/provider-project',
  authorName: 'HashiCorp',
  authorUrl: 'https://hashicorp.com',
  repository: 'https://github.com/terraform-cdk-providers/cdktf-provider-project.git',
  authorOrganization: true,
  peerDeps: [
    `projen@^${version.version}`,
  ],
  license: 'MPL-2.0',
  releaseToNpm: true,
  minNodeVersion: '10.17.0',
  compileBeforeTest: true,
  scripts: {
    'eslint:fix': 'eslint . --ext .ts --fix',
  },
});

project.addFields({ publishConfig: { access: 'public' } });
project.synth();