import { JsonFile, Semver, JsiiProject } from 'projen';

const CDKTF_JSON_FILE = 'cdktf.json';

interface CdktfConfigOptions {
  terraformProvider: string;
}

export class CdktfConfig {
  constructor(project: JsiiProject, options: CdktfConfigOptions) {
    const { terraformProvider } = options;

    project.addPeerDependencies({cdktf: Semver.caret('0.0.13')})
    project.addPeerDependencies({constructs: Semver.caret('3.0.4')})
    project.addScriptCommand('fetch', 'rm -rf ./src/* && cdktf get && cp -R .gen/providers/aws/* ./src/')
    project.addScriptCommand('commit', 'git add -A && git commit -am "Update provider" || echo "No changes to commit"')
    project.replaceScript('build', 'yarn fetch && yarn compile && yarn test && yarn run package && yarn run commit')
    project.replaceScript('compile', 'jsii --silence-warnings=reserved-word')
    project.replaceScript('test', 'jest --passWithNoTests')

    project.addDevDependencies({cdktf: Semver.caret('0.0.13')})
    project.addDevDependencies({'cdktf-cli': Semver.caret('0.0.13')})

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
        terraformProviders: [terraformProvider],
      },
    });
  }
}