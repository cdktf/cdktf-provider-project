import { JsiiProject, JsiiProjectOptions, Semver } from 'projen';
import { CdktfConfig } from './cdktf-config'
import { ProviderUpgrade } from './provider-upgrade'
import * as path from 'path'
import * as fs from 'fs'

const config = JSON.parse(fs.readFileSync(require.resolve(path.join(__dirname, '..', 'package.json'))).toString())
const version = config.version
const projenVersion = config.peerDependencies.projen as string

const PROJEN_VERSION = `@${projenVersion.replace('^', '')}`

interface CdktfProviderProjectOptions extends JsiiProjectOptions {
  terraformProvider: string;
}

const authorName = 'HashiCorp'
const authorUrl = 'https://hashicorp.com'
const namespace = 'cdktf'
const githubNamespace = 'terraform-cdk-providers'

export class CdktfProviderProject extends JsiiProject {

  constructor(options: CdktfProviderProjectOptions) {
    const  { terraformProvider, workflowContainerImage = 'hashicorp/jsii-terraform' } = options;
    const [fqproviderName, providerVersion] = terraformProvider.split('@')
    const providerName = fqproviderName.split('/').pop()

    if (!providerName) {
      throw new Error(`${terraformProvider} doesn't seem to be valid`)
    }

    super({
      ...options,
      workflowContainerImage,
      license: 'MPL-2.0',
      releaseToNpm: true,
      minNodeVersion: '10.17.0',
      devDependencies: {
        '@cdktf/provider-project': Semver.caret(version),
        'dot-prop': Semver.caret('5.2.0'),
      },
      workflowBootstrapSteps: [{ run: 'npm install @cdktf/provider-project@latest' }, { run: `npx projen${PROJEN_VERSION}` }, { run: 'yarn install --frozen-lockfile' }],
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
    });

    new CdktfConfig(this, { terraformProvider, providerName, providerVersion })
    new ProviderUpgrade(this)
  }
}