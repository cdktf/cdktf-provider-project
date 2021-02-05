/* eslint-disable @typescript-eslint/no-require-imports */
import { pascalCase } from 'change-case';
import { JsiiProject, JsiiProjectOptions } from 'projen';
import { CdktfConfig } from './cdktf-config';
import { ProviderUpgrade } from './provider-upgrade';

const version = require('../version.json').version;

interface CdktfProviderProjectOptions extends JsiiProjectOptions {
  terraformProvider: string;
}

const authorName = 'HashiCorp';
const authorUrl = 'https://hashicorp.com';
const namespace = 'cdktf';
const githubNamespace = 'terraform-cdk-providers';

export class CdktfProviderProject extends JsiiProject {

  constructor(options: CdktfProviderProjectOptions) {
    const { terraformProvider, workflowContainerImage = 'hashicorp/jsii-terraform' } = options;
    const [fqproviderName, providerVersion] = terraformProvider.split('@');
    const providerName = fqproviderName.split('/').pop();

    if (!providerName) {
      throw new Error(`${terraformProvider} doesn't seem to be valid`);
    }

    const nugetName = `HashiCorp.${pascalCase(namespace)}.Provider${pascalCase(providerName)}`;

    super({
      ...options,
      workflowContainerImage,
      license: 'MPL-2.0',
      releaseToNpm: true,
      minNodeVersion: '10.17.0',
      devDeps: [
        `@cdktf/provider-project@^${version}`,
        'dot-prop@^5.2.0',
      ],
      name: `@${namespace}/provider-${providerName}`,
      description: `Prebuilt ${providerName} Provider for Terraform CDK (cdktf)`,
      keywords: ['cdktf', 'terraform', 'cdk', 'provider', providerName],
      authorName,
      authorUrl,
      authorOrganization: true,
      repository: `https://github.com/${githubNamespace}/cdktf-provider-${providerName}.git`,
      python: {
        distName: `${namespace}-cdktf-provider-${providerName}`,
        module: `${namespace}_cdktf_provider_${providerName}`,
      },
      publishToNuget: {
        dotNetNamespace: nugetName,
        packageId: nugetName,
      },
    });

    new CdktfConfig(this, { terraformProvider, providerName, providerVersion });
    new ProviderUpgrade(this);
  }
}