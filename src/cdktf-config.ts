import * as path from "path";
import { readFileSync, existsSync } from "fs-extra";
import { JsonFile, cdk } from "projen";
import { PackageInfo } from "./package-info";
import { ReadmeFile } from "./readme";

const CDKTF_JSON_FILE = "cdktf.json";

interface CdktfConfigOptions {
  terraformProvider: string;
  providerName: string;
  providerVersion: string;
  cdktfVersion: string;
  constructsVersion: string;
  packageInfo: PackageInfo;
  githubNamespace: string;
  jsiiVersion?: string;
}

export class CdktfConfig {
  constructor(project: cdk.JsiiProject, options: CdktfConfigOptions) {
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

    const fetchTask = project.addTask("fetch", {
      exec: `mkdir -p src && rm -rf ./src/* && cdktf get && cp -R .gen/providers/${providerName}/* ./src/ && cp .gen/versions.json ./src/version.json`,
      env: {
        CHECKPOINT_DISABLE: "1",
      },
    });
    // execute projen after fetch to ensure that updates to version.json are picked up in package.json
    fetchTask.spawn(project.tasks.tryFind("default")!);

    project.setScript(
      "commit",
      'git add -A && git commit -am "Update provider" || echo "No changes to commit"'
    );
    // eslint-disable-next-line quotes
    project.setScript(
      "should-release",
      `! git diff --exit-code v$(cat version.json | jq -r '.version') ./src ./package.json`
    );
    project.setScript(
      "prebump",
      "yarn fetch && yarn compile && yarn run commit && yarn run should-release"
    );
    project.setScript("compile", "jsii --silence-warnings=reserved-word");

    project.setScript(
      "build-provider",
      "yarn fetch && yarn compile && yarn docgen"
    );
    project.setScript("test", "jest --passWithNoTests");
    project.addFields({ publishConfig: { access: "public" } });

    // set provider name and version from version.json (if it exists yet)
    const versionFile = path.resolve(project.outdir, "src/version.json");

    let fullyQualifiedProviderName = "<unknown>";
    let actualProviderVersion = "<unknown>";
    if (existsSync(versionFile)) {
      const map = JSON.parse(readFileSync(versionFile, "utf8"));
      if (Object.keys(map).length !== 1) {
        throw new Error(
          "version.json must have exactly one entry. specifying multiple providers is not supported"
        );
      }
      const [fqpn, version] = Object.entries(map)[0];
      fullyQualifiedProviderName = fqpn;
      actualProviderVersion = version as string;
    }

    project.addFields({
      cdktf: {
        provider: {
          name: fullyQualifiedProviderName,
          version: actualProviderVersion,
        },
      },
    });

    if (project.npmignore) {
      project.npmignore.exclude(CDKTF_JSON_FILE);
      project.npmignore.exclude(".gen");
      project.npmignore.exclude(".terraform");
      project.npmignore.exclude("cdktf.json");
    }
    project.gitignore.exclude(".gen");
    project.gitignore.exclude(".terraform");
    project.gitignore.exclude("package-lock.json");

    new JsonFile(project, CDKTF_JSON_FILE, {
      obj: {
        language: "typescript",
        app: "echo noop",
        sendCrashReports: false,
        terraformProviders: [terraformProvider],
      },
    });

    new ReadmeFile(project, "README.md", options);
  }
}
