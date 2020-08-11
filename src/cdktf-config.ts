import { JsonFile, Semver, JsiiProject } from 'projen';
import { ReadmeFile } from './readme';

const CDKTF_JSON_FILE = 'cdktf.json';

interface CdktfConfigOptions {
  terraformProvider: string;
  providerName: string;
  providerVersion: string;
}

export class CdktfConfig {
  constructor(project: JsiiProject, options: CdktfConfigOptions) {
    const { terraformProvider, providerName } = options;

    project.addPeerDependencies({cdktf: Semver.caret('0.0.14')})
    project.addPeerDependencies({constructs: Semver.caret('3.0.4')})
    project.addScript('fetch', `rm -rf ./src/* && cdktf get && cp -R .gen/providers/${providerName}/* ./src/`)
    project.addScript('commit', 'git add -A && git commit -am "Update provider" || echo "No changes to commit"')
    project.addScript('prebump', 'yarn fetch && yarn compile && yarn run commit')
    project.addScript('compile', 'jsii --silence-warnings=reserved-word')
    project.addScript('test', 'jest --passWithNoTests')
    project.addFields({publishConfig: {access: 'public'}})

    project.addDevDependencies({cdktf: Semver.caret('0.0.14')})
    project.addDevDependencies({'cdktf-cli': Semver.caret('0.0.14')})

    project.npmignore.comment('cdktf config');
    project.npmignore.exclude(CDKTF_JSON_FILE);
    project.npmignore.exclude('.gen');
    project.npmignore.exclude('.terraform');
    project.npmignore.exclude('cdktf.json');

    project.gitignore.comment('ignore cdktf builds')
    project.gitignore.exclude('.gen');
    project.gitignore.exclude('.terraform');
    project.gitignore.exclude('package-lock.json');

    new JsonFile(project, CDKTF_JSON_FILE, {
      obj: {
        language: 'typescript',
        app: 'echo noop',
        terraformProviders: [terraformProvider],
      },
    });

    new ReadmeFile(project, 'README.md', options)
  }
}