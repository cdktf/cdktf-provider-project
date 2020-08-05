import { JsiiProject, JsiiProjectOptions, Semver } from 'projen';
import { CdktfConfig } from './cdktf-config'

const PROJEN_VERSION = '@0.3.23'

interface CdktfProviderProjectOptions extends JsiiProjectOptions {
  terraformProvider: string;
}

export class CdktfProviderProject extends JsiiProject {

  constructor(options: CdktfProviderProjectOptions) {
    const  { workflowContainerImage = 'hashicorp/jsii-terraform' } = options;

    super({
      ...options,
      workflowContainerImage,
      license: 'MPL-2.0',
      releaseToNpm: true,
      minNodeVersion: '10.17.0',
      devDependencies: {
        'cdktf-provider': Semver.caret('0.0.11'),
      },
      workflowBootstrapSteps: [{ run: 'npm install cdktf-provider@latest' }, { run: `npx projen${PROJEN_VERSION}` }, { run: 'yarn install --frozen-lockfile' }],
    });

    const {  terraformProvider } = options;

    new CdktfConfig(this, { terraformProvider })
  }
}