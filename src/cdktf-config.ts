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

    const cdktfVersion = Semver.caret('0.0')

    project.addPeerDependencies({cdktf: cdktfVersion})
    project.addPeerDependencies({constructs: Semver.caret('3.0.4')})
    project.addScript('fetch', `rm -rf ./src/* && cdktf get && cp -R .gen/providers/${providerName}/* ./src/`)
    project.addScript('commit', 'git add -A && git commit -am "Update provider" || echo "No changes to commit"')
    // eslint-disable-next-line quotes
    project.addScript('should-release', `! git diff --exit-code v$(cat version.json | jq -r '.version') ./src ./package.json`)
    project.addScript('prebump', 'yarn fetch && yarn compile && yarn run commit && yarn run should-release')
    project.addScript('compile', 'jsii --silence-warnings=reserved-word')
    project.addScript('test', 'jest --passWithNoTests')
    project.addFields({publishConfig: {access: 'public'}})

    project.addDevDependencies({cdktf: cdktfVersion})
    project.addDevDependencies({'cdktf-cli': cdktfVersion})

    project.npmignore.exclude(CDKTF_JSON_FILE);
    project.npmignore.exclude('.gen');
    project.npmignore.exclude('.terraform');
    project.npmignore.exclude('cdktf.json');
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