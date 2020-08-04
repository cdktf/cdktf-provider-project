import { JsiiProject, JsiiProjectOptions, Semver } from 'projen';

export class CdktfProviderProject extends JsiiProject {

  constructor(options: JsiiProjectOptions) {
    super({
      ...options,
    });

    this.addPeerDependencies({cdktf: Semver.caret('0.13')})
    this.addPeerDependencies({constructs: Semver.caret('3.0')})
    this.addScriptCommand('fetch', 'rm -rf ./lib/* && cdktf get && cp -R .gen/providers/aws/* ./lib/')
  }
}