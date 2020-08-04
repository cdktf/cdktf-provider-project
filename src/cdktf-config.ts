import { JsonFile, Semver, JsiiProject } from 'projen';

const CDKTF_JSON_FILE = 'cdktf.json';

export class CdktfConfig {
  constructor(project: JsiiProject) {
    project.addPeerDependencies({cdktf: Semver.caret('0.13')})
    project.addPeerDependencies({constructs: Semver.caret('3.0')})
    project.addScriptCommand('fetch', 'rm -rf ./lib/* && cdktf get && cp -R .gen/providers/aws/* ./lib/')

    project.addDevDependencies({cdktf: Semver.caret('0.13')})
    project.addDevDependencies({'cdktf-cli': Semver.caret('0.13')})

    project.npmignore.comment('cdktf config');
    project.npmignore.exclude(CDKTF_JSON_FILE);
    project.npmignore.exclude('.gen');
    project.npmignore.exclude('.terraform');
    project.npmignore.exclude('cdktf.json');

    project.gitignore.comment('ignore cdktf builds')
    project.gitignore.exclude('.gen');
    project.gitignore.exclude('.terraform');

    new JsonFile(project, CDKTF_JSON_FILE, {
      obj: {
        language: 'typescript',
        app: 'echo noop',
        terraformProviders: ['aws@~> 2.0'],
      },
    });
  }
}