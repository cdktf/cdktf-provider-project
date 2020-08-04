import { JsiiProject, JsiiProjectOptions, Semver } from 'projen';
import { CdktfConfig } from './cdktf-config'

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
        'cdktf-provider': Semver.caret('0.0.3'),
      },
    });

    const {  terraformProvider } = options;

    new CdktfConfig(this, { terraformProvider })
  }
}