/* eslint-disable @typescript-eslint/no-require-imports */
import { pascalCase } from 'change-case';
import { JsiiProject, JsiiProjectOptions } from 'projen';
import { AutoMerge } from './auto-merge';
import { CdktfConfig } from './cdktf-config';
import { ProviderUpgrade } from './provider-upgrade';

const version = require('../version.json').version;

export interface CdktfProviderProjectOptions extends JsiiProjectOptions {
  readonly terraformProvider: string;
  readonly cdktfVersion: string;
  readonly constructsVersion: string;
}

const authorName = 'HashiCorp';
const authorAddress = 'https://hashicorp.com';
const namespace = 'cdktf';
const githubNamespace = 'hashicorp';

export class CdktfProviderProject extends JsiiProject {

  constructor(options: CdktfProviderProjectOptions) {
    const {
      terraformProvider,
      workflowContainerImage = 'hashicorp/jsii-terraform',
      cdktfVersion,
      constructsVersion,
      minNodeVersion,
    } = options;
    const [fqproviderName, providerVersion] = terraformProvider.split('@');
    const providerName = fqproviderName.split('/').pop();
    if (!providerName) {
      throw new Error(`${terraformProvider} doesn't seem to be valid`);
    }
    const nugetName = `HashiCorp.${pascalCase(namespace)}.Providers.${pascalCase(providerName)}`;

    super({
      ...options,
      workflowContainerImage,
      license: 'MPL-2.0',
      releaseToNpm: true,
      minNodeVersion,
      devDeps: [
        `@cdktf/provider-project@^${version}`,
        'dot-prop@^5.2.0',
      ],
      name: `@${namespace}/provider-${providerName}`,
      description: `Prebuilt ${providerName} Provider for Terraform CDK (cdktf)`,
      keywords: ['cdktf', 'terraform', 'cdk', 'provider', providerName],
      sampleCode: false,
      jest: false,
      authorAddress,
      authorName,
      authorOrganization: true,
      defaultReleaseBranch: 'main',
      repository: `https://github.com/${githubNamespace}/cdktf-provider-${providerName}.git`,
      mergify: false,
      eslint: false,
      python: {
        distName: `${namespace}-cdktf-provider-${providerName}`,
        module: `${namespace}_cdktf_provider_${providerName}`,
      },
      publishToNuget: {
        dotNetNamespace: nugetName,
        packageId: nugetName,
      },
      peerDependencyOptions: {
        pinnedDevDependency: false,
      },
    });

    new CdktfConfig(this, { terraformProvider, providerName, providerVersion, cdktfVersion, constructsVersion });
    new ProviderUpgrade(this);
    new AutoMerge(this);
  }
}