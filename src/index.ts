/* eslint-disable @typescript-eslint/no-require-imports */
import { pascalCase } from 'change-case';
import { JsiiProject, JsiiProjectOptions } from 'projen';
import { AutoMerge } from './auto-merge';
import { CdktfConfig } from './cdktf-config';
import { PackageInfo } from './package-info';
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

const getMavenName = (providerName: string): string => {
  return ['null', 'random'].includes(providerName) ? `${providerName}_provider` : providerName;
};
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
    const mavenName = `com.${githubNamespace}.cdktf.providers.${getMavenName(providerName)}`;

    const packageInfo: PackageInfo = {
      npm: {
        name: `@${namespace}/provider-${providerName}`,
      },
      python: {
        distName: `${namespace}-cdktf-provider-${providerName}`,
        module: `${namespace}_cdktf_provider_${providerName}`,
      },
      publishToNuget: {
        dotNetNamespace: nugetName,
        packageId: nugetName,
      },
      publishToMaven: {
        javaPackage: mavenName,
        mavenGroupId: `com.${githubNamespace}`,
        mavenArtifactId: `cdktf-provider-${providerName}`,
      },
    };

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
      name: packageInfo.npm.name,
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
      python: packageInfo.python,
      publishToNuget: packageInfo.publishToNuget,
      publishToMaven: packageInfo.publishToMaven,
      peerDependencyOptions: {
        pinnedDevDependency: false,
      },
      workflowGitIdentity: {
        name: 'team-tf-cdk',
        email: 'github-team-tf-cdk@hashicorp.com',
      },
    });

    new CdktfConfig(this, { terraformProvider, providerName, providerVersion, cdktfVersion, constructsVersion, packageInfo });
    new ProviderUpgrade(this);
    new AutoMerge(this);
  }
}