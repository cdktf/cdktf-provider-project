import { JsiiProject, JsiiProjectOptions } from 'projen';
import { CdktfConfig } from './cdktf-config'

export class CdktfProviderProject extends JsiiProject {

  constructor(options: JsiiProjectOptions) {
    super({
      ...options,
    });

    new CdktfConfig(this)
  }
}