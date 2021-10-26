import { JsonFile, JsiiProject } from 'projen';
import { PackageInfo } from './package-info';
import { ReadmeFile } from './readme';

const CDKTF_JSON_FILE = 'cdktf.json';

interface CdktfConfigOptions {
  terraformProvider: string;
  providerName: string;
  providerVersion: string;
  cdktfVersion: string;
  constructsVersion: string;
  packageInfo: PackageInfo;
  jsiiVersion?: string;
}

export class CdktfConfig {
  constructor(project: JsiiProject, options: CdktfConfigOptions) {
    const { terraformProvider, providerName, jsiiVersion } = options;

    const cdktfVersion = options.cdktfVersion;
    const constructsVersion = options.constructsVersion;

    project.addPeerDeps(`cdktf@${cdktfVersion}`);
    project.addPeerDeps(`constructs@${constructsVersion}`);

    project.addDevDeps(`cdktf@${cdktfVersion}`);
    project.addDevDeps(`cdktf-cli@${cdktfVersion}`);
    project.addDevDeps(`constructs@${constructsVersion}`);

    if (jsiiVersion) {
      project.addDevDeps(`jsii@${jsiiVersion}`);
    }

    project.setScript('fetch', `mkdir -p src && rm -rf ./src/* && cdktf get && cp -R .gen/providers/${providerName}/* ./src/`);
    project.setScript('commit', 'git add -A && git commit -am "Update provider" || echo "No changes to commit"');
    // eslint-disable-next-line quotes
    project.setScript('should-release', `! git diff --exit-code v$(cat version.json | jq -r '.version') ./src ./package.json`);
    project.setScript('prebump', 'yarn fetch && yarn compile && yarn run commit && yarn run should-release');
    project.setScript('compile', 'jsii --silence-warnings=reserved-word');

    project.setScript('build-provider', 'yarn fetch && yarn compile && yarn docgen');
    project.setScript('test', 'jest --passWithNoTests');
    project.addFields({ publishConfig: { access: 'public' } });

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
