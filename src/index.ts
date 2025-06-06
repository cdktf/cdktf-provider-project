/* eslint-disable @typescript-eslint/no-require-imports */
import assert = require("assert");
import { pascalCase } from "change-case";
import { TextFile, cdk, github, JsonPatch } from "projen";
import { JobStep } from "projen/lib/github/workflows-model";
import { UpgradeDependenciesSchedule } from "projen/lib/javascript";
import { AlertOpenPrs } from "./alert-open-prs";
import { AutoApprove } from "./auto-approve";
import { AutoCloseCommunityIssues } from "./auto-close-community-issues";
import { Automerge } from "./automerge";
import { CdktfConfig } from "./cdktf-config";
import { CopyrightHeaders } from "./copyright-headers";
import { CustomizedLicense } from "./customized-license";
import { Dependabot } from "./dependabot";
import { DeprecatePackages } from "./deprecate-packages";
import { ForceRelease } from "./force-release";
import { GithubIssues } from "./github-issues";
import { LockIssues } from "./lock-issues";
import { PackageInfo } from "./package-info";
import { ProviderUpgrade } from "./provider-upgrade";
import { CheckForUpgradesScriptFile } from "./scripts/check-for-upgrades";
import { ShouldReleaseScriptFile } from "./scripts/should-release";
import { generateRandomCron, Schedule } from "./util/random-cron";

// ensure new projects start with 1.0.0 so that every following breaking change leads to an increased major version
const MIN_MAJOR_VERSION = 1;

export interface CdktfProviderProjectOptions extends cdk.JsiiProjectOptions {
  readonly useCustomGithubRunner?: boolean;
  readonly terraformProvider: string;
  readonly cdktfVersion: string;
  readonly constructsVersion: string;
  readonly forceMajorVersion?: number;
  /**
   * defaults to "cdktf"
   */
  readonly namespace?: string;
  /**
   * defaults to "cdktf"
   * previously was "hashicorp". Used for GitHub org name and package scoping
   */
  readonly githubNamespace?: string;
  readonly mavenEndpoint?: string;
  /**
   * defaults to "HashiCorp"
   */
  readonly nugetOrg?: string;
  /**
   * defaults to "hashicorp"
   */
  readonly mavenOrg?: string;
  /**
   * defaults to "com.${mavenOrg}"
   */
  readonly mavenGroupId?: string;
  /**
   * The year of the creation of the repository, for copyright purposes.
   * Will fall back to the current year if not specified.
   */
  readonly creationYear?: number;
  /**
   * Whether or not this prebuilt provider is deprecated.
   * If true, no new versions will be published.
   */
  readonly isDeprecated?: boolean;
  /**
   * An optional date when the project should be considered deprecated, to be used in the README text.
   * If no date is provided, then the date of the build will be used by default.
   */
  readonly deprecationDate?: string;
  /**
   * defaults to "HashiCorp, Inc."
   */
  readonly licensee?: string;
}

const getMavenName = (providerName: string): string => {
  return ["null", "random"].includes(providerName)
    ? `${providerName}_provider`
    : providerName.replace(/-/gi, "_");
};

const githubActionPinnedVersions = {
  "actions/checkout": "11bd71901bbe5b1630ceea73d27597364c9af683", // v4.2.2
  "actions/download-artifact": "95815c38cf2ff2164869cbab79da8d1f422bc89e", // v4.2.1
  "actions/github-script": "60a0d83039c74a4aee543508d2ffcb1c3799cdea", // v7.0.1
  "actions/setup-dotnet": "67a3573c9a986a3f9c594539f4ab511d57bb3ce9", // v4.3.1
  "actions/setup-go": "0aaccfd150d50ccaeb58ebd88d36e91967a5f35b", // v5.4.0
  "actions/setup-java": "3a4f6e1af504cf6a31855fa899c6aa5355ba6c12", // v4.7.0
  "actions/setup-node": "cdca7365b2dadb8aad0a33bc7601856ffabcc48e", // v4.3.0
  "actions/setup-python": "42375524e23c412d93fb67b49958b491fce71c38", // v5.4.0
  "actions/stale": "5bef64f19d7facfb25b37b414482c7164d639639", // v9.1.0
  "actions/upload-artifact": "ea165f8d65b6e75b540449e92b4886f43607fa02", // v4.6.2
  "amannn/action-semantic-pull-request":
    "0723387faaf9b38adef4775cd42cfd5155ed6017", // v5.5.3
  "dessant/lock-threads": "1bf7ec25051fe7c00bdd17e6a7cf3d7bfb7dc771", // v5.0.1
  "hashicorp/setup-copywrite": "32638da2d4e81d56a0764aa1547882fc4d209636", // v1.1.3
  "hashicorp/setup-terraform": "b9cd54a3c349d3f38e8881555d616ced269862dd", // v3.1.2
  "imjohnbo/issue-bot": "572eed14422c4d6ca37e870f97e7da209422f5bd", // v3.4.4
  "peter-evans/create-pull-request": "271a8d0340265f705b14b6d32b9829c1cb33d45e", // v7.0.8
  "slackapi/slack-github-action": "485a9d42d3a73031f12ec201c457e2162c45d02d", // v2.0.0
};

export class CdktfProviderProject extends cdk.JsiiProject {
  constructor(options: CdktfProviderProjectOptions) {
    const {
      terraformProvider,
      workflowContainerImage,
      cdktfVersion,
      constructsVersion,
      minNodeVersion,
      jsiiVersion,
      typescriptVersion,
      isDeprecated,
      deprecationDate,
      authorName = "HashiCorp",
      authorAddress = "https://hashicorp.com",
      namespace = "cdktf",
      githubNamespace = "cdktf",
      mavenEndpoint = "https://hashicorp.oss.sonatype.org",
      nugetOrg = "HashiCorp",
      mavenOrg = "hashicorp",
    } = options;

    const [fqproviderName, providerVersion] = terraformProvider.split("@");
    const providerName = fqproviderName.split("/").pop();
    assert(providerName, `${terraformProvider} doesn't seem to be valid`);
    assert(
      !providerName.endsWith("-go"),
      "providerName may not end with '-go' as this can conflict with repos for go packages"
    );

    const nugetName = `${nugetOrg}.${pascalCase(
      namespace
    )}.Providers.${pascalCase(providerName)}`;
    const mavenGroupId = options.mavenGroupId ?? `com.${mavenOrg}`;
    const mavenName = `${mavenGroupId}.${namespace}.providers.${getMavenName(
      providerName
    )}`;
    const repository = `${githubNamespace}/${namespace}-provider-${providerName.replace(
      /-/g,
      ""
    )}`;
    const repositoryUrl = `github.com/${repository}`;

    const packageInfo: PackageInfo = {
      npm: {
        name: `@${githubNamespace}/provider-${providerName}`,
      },
      python: {
        distName: `${githubNamespace}-${namespace}-provider-${providerName.replace(
          /-/gi,
          "_"
        )}`,
        module: `${githubNamespace}_${namespace}_provider_${providerName.replace(
          /-/gi,
          "_"
        )}`,
      },
      publishToNuget: {
        dotNetNamespace: nugetName,
        packageId: nugetName,
      },
      publishToMaven: {
        javaPackage: mavenName,
        mavenGroupId: mavenGroupId,
        mavenArtifactId: `${namespace}-provider-${providerName}`,
        mavenEndpoint,
      },
      publishToGo: {
        moduleName: `${repositoryUrl}-go`,
        gitUserEmail: "github-team-tf-cdk@hashicorp.com",
        gitUserName: "CDK for Terraform Team",
        packageName: providerName.replace(/-/g, ""),
        // In order to use the copywrite action, we need to rebuild the full pre-publish steps workflow unfortunately
        // If someone knows a better way to do this mutation with minimal custom code, please do so
        prePublishSteps: [
          {
            name: "Checkout",
            uses: "actions/checkout",
            with: {
              path: ".repo",
            },
          },
          {
            name: "Install Dependencies",
            run: "cd .repo && yarn install --check-files --frozen-lockfile",
          },
          {
            name: "Extract build artifact",
            run: "tar --strip-components=1 -xzvf dist/js/*.tgz -C .repo",
          },
          {
            name: "Move build artifact out of the way",
            run: "mv dist dist.old",
          },
          {
            name: "Create go artifact",
            run: "cd .repo && npx projen package:go",
          },
          {
            name: "Setup Copywrite tool",
            uses: "hashicorp/setup-copywrite",
          },
          {
            name: "Copy copywrite hcl file",
            run: "cp .repo/.copywrite.hcl .repo/dist/go/.copywrite.hcl",
          },
          {
            name: "Add headers using Copywrite tool",
            run: "cd .repo/dist/go && copywrite headers",
          },
          {
            name: "Remove copywrite hcl file",
            run: "rm -f .repo/dist/go/.copywrite.hcl",
          },
          {
            name: "Remove some text from the README that doesn't apply to Go",
            run: [
              "sed -i 's/# CDKTF prebuilt bindings for/# CDKTF Go bindings for/' .repo/dist/go/*/README.md",
              // @see https://stackoverflow.com/a/49511949
              // eslint-disable-next-line prettier/prettier
              // prettier-ignore
              `sed -i -e '/## ${isDeprecated ? "Deprecated" : "Available"} Packages/,/### Go/!b' -e '/### Go/!d;p; s/### Go/## Go Package/' -e 'd' .repo/dist/go/*/README.md`,
              // sed -e is black magic and for whatever reason the string replace doesn't work so let's try it again:
              // eslint-disable-next-line prettier/prettier
              // prettier-ignore
              `sed -i 's/### Go/## ${isDeprecated ? "Deprecated" : "Go"} Package/' .repo/dist/go/*/README.md`,
              // Just straight up delete these full lines and everything in between them:
              "sed -i -e '/API.typescript.md/,/You can also visit a hosted version/!b' -e 'd' .repo/dist/go/*/README.md",
              `sed -i 's|Find auto-generated docs for this provider here:|Find auto-generated docs for this provider [here](https://${repositoryUrl}/blob/main/docs/API.go.md).|' .repo/dist/go/*/README.md`,
              // Just straight up delete these full lines and everything in between them:
              "sed -i -e '/### Provider Version/,/The provider version can be adjusted/!b' -e 'd' .repo/dist/go/*/README.md",
            ].join("\n"),
          },
          {
            name: "Copy the README file to the parent directory",
            run: "cp .repo/dist/go/*/README.md .repo/dist/go/README.md",
          },
          {
            name: "Collect go Artifact",
            run: "mv .repo/dist dist",
          },
        ],
      },
    };

    const workflowRunsOn = options.useCustomGithubRunner
      ? ["custom-linux-medium"] // 8 core, 32 GB
      : ["ubuntu-latest"]; // 7 GB

    super({
      ...options,
      authorAddress,
      authorName,
      minNodeVersion,
      workflowContainerImage,
      workflowRunsOn,
      licensed: false, // we do supply our own license file with a custom header
      releaseToNpm: true,
      name: packageInfo.npm.name,
      description: `Prebuilt ${providerName} Provider for Terraform CDK (cdktf)`,
      keywords: ["cdktf", "terraform", "cdk", "provider", providerName],
      sampleCode: false,
      jest: false,
      authorOrganization: true,
      defaultReleaseBranch: "main",
      repository: `https://github.com/${repository}.git`,
      mergify: false,
      eslint: false,
      depsUpgrade: !isDeprecated,
      depsUpgradeOptions: {
        workflowOptions: {
          labels: ["automerge", "auto-approve", "dependencies"],
          schedule: UpgradeDependenciesSchedule.WEEKLY,
        },
      },
      python: packageInfo.python,
      publishToNuget: packageInfo.publishToNuget,
      publishToMaven: packageInfo.publishToMaven,
      publishToGo: packageInfo.publishToGo,
      releaseFailureIssue: true,
      peerDependencyOptions: {
        pinnedDevDependency: false,
      },
      workflowGitIdentity: {
        name: "team-tf-cdk",
        email: "github-team-tf-cdk@hashicorp.com",
      },
      minMajorVersion: MIN_MAJOR_VERSION,
      stale: true,
      staleOptions: {
        issues: {
          staleLabel: "stale",
          daysBeforeStale: 45,
          staleMessage:
            "45 days have passed since this issue was opened, and I assume other publishes have succeeded in the meantime. " +
            "If no one removes the `stale` label or comments, I'm going to auto-close this issue in 14 days.",
          daysBeforeClose: 14,
          closeMessage:
            "2 months have passed, so I'm closing this issue with the assumption that other publishes have succeeded in the meantime.",
        },
        pullRequest: {
          staleLabel: "stale",
          daysBeforeStale: 1,
          staleMessage: `Closing this PR, if it has not merged there is most likely a CI or CDKTF issue preventing it from merging. If this has been a manual PR, please reopen it and add the \`no-auto-close\` label to prevent this from happening again.`,
          daysBeforeClose: 0,
          exemptLabels: ["no-auto-close"],
        },
      },
      pullRequestTemplate: false,
      docgen: false,
    });

    this.addDevDeps(
      "dot-prop@^5.2.0",
      "@actions/core@^1.1.0",
      "@action-validator/core",
      "@action-validator/cli"
    );

    // Default memory is 7GB: https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources
    // Custom Runners we use have 32GB of memory
    // The below numbers set heap limits that are ~1gb and ~0.5gb less, respectively, than the total available memory
    const maxOldSpaceSize = options.useCustomGithubRunner ? "31744" : "6656";

    // Golang needs more memory to build
    this.tasks.addEnvironment(
      "NODE_OPTIONS",
      `--max-old-space-size=${maxOldSpaceSize}`
    );

    this.tasks.addEnvironment("CHECKPOINT_DISABLE", "1");

    const validateTask = this.addTask("validate-workflows", {
      exec: `find ./.github/workflows -type f -name "*.yml" -print0 | xargs -0 -n 1 npx action-validator`,
    });
    validateTask.description =
      "Lint the YAML files generated by Projen to define GitHub Actions and Workflows, checking them against published JSON schemas";
    this.postCompileTask.spawn(validateTask);

    this.package.addPackageResolutions("@types/yargs@17.0.13");

    const setSafeDirectory = {
      name: "Set git config safe.directory",
      run: "git config --global --add safe.directory $(pwd)",
    };

    ((this.buildWorkflow as any).preBuildSteps as JobStep[]).push(
      setSafeDirectory
    );
    (this.release as any).defaultBranch.workflow.jobs.release.steps.splice(
      1,
      0,
      setSafeDirectory
    );

    // always publish a new GitHub release, even when publishing to a particular package manager fails
    const releaseWorkflow = this.tryFindObjectFile(
      ".github/workflows/release.yml"
    );
    releaseWorkflow?.addOverride("jobs.release_github.needs", "release");

    // ensure we don't fail if the release file is not present
    const checkExistingTagStep = (
      this.release as any
    ).defaultBranch.workflow.jobs.release.steps.find(
      (s: object) => "id" in s && s.id === "check_tag_exists"
    );
    const oldExistingTagRun: string = checkExistingTagStep.run;
    prettyAssertEqual(
      oldExistingTagRun.split("\n")[0],
      "TAG=$(cat dist/releasetag.txt)",
      "release step changed, please check if the workaround still works!"
    );
    checkExistingTagStep.run = `if [ ! -f dist/releasetag.txt ]; then (echo "exists=true" >> $GITHUB_OUTPUT) && exit 0; fi\n${oldExistingTagRun}`;

    if (!isDeprecated) {
      const { upgrade, pr } = (this.upgradeWorkflow as any).workflows[0].jobs;
      upgrade.steps.splice(1, 0, setSafeDirectory);
      pr.steps.splice(1, 0, setSafeDirectory);
    }

    // Fix maven issue (https://github.com/cdklabs/publib/pull/777)
    github.GitHub.of(this)?.tryFindWorkflow("release")?.file?.patch(
      JsonPatch.add(
        "/jobs/release_maven/steps/10/env/MAVEN_OPTS",
        // See https://stackoverflow.com/questions/70153962/nexus-staging-maven-plugin-maven-deploy-failed-an-api-incompatibility-was-enco
        "--add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.lang.reflect=ALL-UNNAMED --add-opens=java.base/java.text=ALL-UNNAMED --add-opens=java.desktop/java.awt.font=ALL-UNNAMED"
      )
    );

    this.pinGithubActionVersions(githubActionPinnedVersions);

    new CdktfConfig(this, {
      terraformProvider,
      providerName,
      fqproviderName,
      providerVersion,
      cdktfVersion,
      constructsVersion,
      jsiiVersion,
      typescriptVersion,
      packageInfo,
      githubNamespace,
      deprecationDate,
      isDeprecated: !!isDeprecated,
    });
    new CustomizedLicense(this, options.creationYear, options.licensee);
    new GithubIssues(this, { providerName });
    new AutoApprove(this);
    new AutoCloseCommunityIssues(this, { providerName });
    new Automerge(this);
    new LockIssues(this);

    if (!isDeprecated) {
      const upgradeScript = new CheckForUpgradesScriptFile(this, {
        providerVersion,
        fqproviderName,
      });
      new ProviderUpgrade(this, {
        checkForUpgradesScriptPath: upgradeScript.path,
        workflowRunsOn,
        nodeHeapSize: maxOldSpaceSize,
      });
      new AlertOpenPrs(this, {
        slackWebhookUrl: "${{ secrets.ALERT_PRS_SLACK_WEBHOOK_URL }}",
        repository,
      });
      new Dependabot(this);
    }

    new TextFile(this, ".github/CODEOWNERS", {
      lines: [
        "# These owners will be the default owners for everything in ",
        "# the repo. Unless a later match takes precedence, ",
        "# they will be requested for review when someone opens a ",
        "# pull request.",
        "*       @cdktf/tf-cdk-team",
      ],
    });

    if (!isDeprecated) {
      new ShouldReleaseScriptFile(this, {});

      const releaseTask = this.tasks.tryFind("release")!;
      this.removeTask("release");
      this.addTask("release", {
        description: releaseTask.description,
        steps: releaseTask.steps,
        env: (releaseTask as any)._env,
        condition: "node ./scripts/should-release.js",
      });
      this.addTask("unconditional-release", {
        description: releaseTask.description,
        steps: releaseTask.steps,
        env: (releaseTask as any)._env,
      });

      const releaseJobSteps: any[] = (
        this.github?.tryFindWorkflow("release") as any
      ).jobs.release.steps;
      const gitRemoteJob = releaseJobSteps.find((it) => it.id === "git_remote");
      prettyAssertEqual(
        gitRemoteJob.run,
        'echo "latest_commit=$(git ls-remote origin -h ${{ github.ref }} | cut -f1)" >> $GITHUB_OUTPUT\ncat $GITHUB_OUTPUT',
        "git_remote step in release workflow did not match expected string, please check if the workaround still works!"
      );
      const previousCommand = gitRemoteJob.run.replace("\n", " && ");

      const cancelCommand =
        'echo "latest_commit=release_cancelled" >> $GITHUB_OUTPUT'; // this cancels the release via a non-matching SHA;
      gitRemoteJob.run = `node ./scripts/should-release.js && (${previousCommand}) || ${cancelCommand}`;
      gitRemoteJob.name +=
        " or cancel via faking a SHA if release was cancelled";
    }

    const staleWorkflow = this.tryFindObjectFile(".github/workflows/stale.yml");
    staleWorkflow?.addOverride("on.schedule", [
      {
        cron: generateRandomCron({ project: this, maxHour: 4, hourOffset: 1 }),
      },
    ]);

    const upgradeWorkflow = this.tryFindObjectFile(
      ".github/workflows/upgrade-main.yml"
    );
    upgradeWorkflow?.addOverride("on.schedule", [
      {
        cron: generateRandomCron({
          project: this,
          maxHour: 0,
          hourOffset: 1,
          schedule: Schedule.Weekly,
        }),
      },
    ]);

    // Submodule documentation generation
    this.gitignore.exclude("API.md"); // ignore the old file, we now generate it in the docs folder
    this.addDevDeps("jsii-docgen@^10.2.3");
    if (jsiiVersion) {
      // NOTE: the below is making a broad assumption that you're passing a range like "~5.3.0" to jsiiVersion
      // If you use that field to pass a very specific version (e.g. "5.3.11") then this might break
      this.addDevDeps(`jsii-rosetta@${jsiiVersion}`);
    } else {
      this.addDevDeps(`jsii-rosetta`);
    }

    const docgen = this.addTask("docgen", {
      description: "Generate documentation for the project",
      steps: [
        {
          exec: [
            "rm -rf docs",
            "rm -f API.md",
            "mkdir docs",
            "jsii-docgen --split-by-submodule -l typescript -l python -l java -l csharp -l go",
            // There is no nice way to tell jsii-docgen to generate docs into a folder so I went this route
            "mv *.*.md docs",
            // Some part of the documentation are too long, we need to truncate them to ~10MB
            "cd docs",
            "ls ./ | xargs sed -i '150000,$ d' $1",
          ].join(" && "),
        },
      ],
    });
    this.postCompileTask.spawn(docgen);
    this.gitignore.include(`/docs/*.md`);
    this.annotateGenerated(`/docs/*.md`);

    // Setting the version in package.json so the golang docs have the correct version
    const unconditionalBump = this.addTask("unconditional-bump", {
      description: "Set the version in package.json to the current version",
      steps: [
        {
          name: "Clear the changelog so that it doesn't get published twice",
          exec: "rm -f $CHANGELOG",
        },
        { builtin: "release/bump-version" },
      ],
      env: {
        OUTFILE: "package.json",
        CHANGELOG: "dist/changelog.md",
        BUMPFILE: "dist/version.txt",
        RELEASETAG: "dist/releasetag.txt",
        RELEASE_TAG_PREFIX: "",
        MIN_MAJOR: String(MIN_MAJOR_VERSION),
      },
    });
    this.preCompileTask.spawn(unconditionalBump);
    // To bump correctly we need to have the completely cloned repo
    (this.buildWorkflow as any).workflow.file.addOverride(
      "jobs.build.steps.0.with.fetch-depth",
      0
    );
    // Undo the changes after compilation
    this.buildWorkflow?.addPostBuildSteps({
      name: "Revert package.json version bump",
      run: "git checkout package.json",
    });

    new CopyrightHeaders(this);
    new DeprecatePackages(this, {
      providerName,
      packageInfo,
      isDeprecated: !!isDeprecated,
    });
    if (!isDeprecated) {
      new ForceRelease(this, { workflowRunsOn });
    }
  }

  private pinGithubActionVersions(pinnedVersions: Record<string, string>) {
    // Use pinned versions of github actions
    Object.entries(pinnedVersions).forEach(([name, sha]) => {
      this.github?.actions.set(name, `${name}@${sha}`);
    });
  }
}

function prettyAssertEqual<T>(subject: T, expected: T, message?: string): void {
  if (subject !== expected) {
    throw new Error(
      `${message ?? "Assertion failed"}: expected ${JSON.stringify(
        expected
      )} but got ${JSON.stringify(subject)}`
    );
  }
}
