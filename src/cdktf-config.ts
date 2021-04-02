import { JsonFile, JsiiProject } from 'projen';
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

    const cdktfVersion = '^0.x';

    project.addPeerDeps(`cdktf@${cdktfVersion}`);
    project.addPeerDeps('constructs@^3.0.4');
    project.setScript('fetch', `rm -rf ./src/* && cdktf get && cp -R .gen/providers/${providerName}/* ./src/`);
    project.setScript('commit', 'git add -A && git commit -am "Update provider" || echo "No changes to commit"');
    // eslint-disable-next-line quotes
    project.setScript('should-release', `! git diff --exit-code v$(cat version.json | jq -r '.version') ./src ./package.json`);
    project.setScript('prebump', 'yarn fetch && yarn compile && yarn run commit && yarn run should-release');
    project.setScript('compile', 'jsii --silence-warnings=reserved-word');
    project.setScript('test', 'jest --passWithNoTests');
    project.addFields({ publishConfig: { access: 'public' } });

    project.addDevDeps(`cdktf@${cdktfVersion}`);
    project.addDevDeps(`cdktf-cli@${cdktfVersion}`);

    if (project.npmignore) {
      project.npmignore.exclude(CDKTF_JSON_FILE);
      project.npmignore.exclude('.gen');
      project.npmignore.exclude('.terraform');
      project.npmignore.exclude('cdktf.json');
    }
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

    new ReadmeFile(project, 'README.md', options);
  }
}
