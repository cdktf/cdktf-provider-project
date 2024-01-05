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
  "actions/checkout": "b4ffde65f46336ab88eb53be808477a3936bae11", // v4.1.1
  "actions/download-artifact": "9bc31d5ccc31df68ecc42ccf4149144866c47d8a", // v3.0.2
  "actions/github-script": "60a0d83039c74a4aee543508d2ffcb1c3799cdea", // v7.0.1
  "actions/setup-dotnet": "3447fd6a9f9e57506b15f895c5b76d3b197dc7c2", // v3.2.0
  "actions/setup-go": "93397bea11091df50f3d7e59dc26a7711a8bcfbe", // v4.1.0
  "actions/setup-java": "0ab4596768b603586c0de567f2430c30f5b0d2b0", // v3.13.0
  "actions/setup-node": "8f152de45cc393bb48ce5d89d36b731f54556e65", // v4.0.0
  "actions/setup-python": "65d7f2d534ac1bc67fcd62888c5f4f3d2cb2b236", // v4.7.1
  "actions/stale": "28ca1036281a5e5922ead5184a1bbf96e5fc984e", // v9.0.0
  "actions/upload-artifact": "a8a3f3ad30e3422c9c7b888a15615d19a852ae32", // v3.1.3
  "amannn/action-semantic-pull-request":
    "e9fabac35e210fea40ca5b14c0da95a099eff26f", // v5.4.0
  "dessant/lock-threads": "1bf7ec25051fe7c00bdd17e6a7cf3d7bfb7dc771", // v5.0.1
  "hashicorp/setup-copywrite": "867a1a2a064a0626db322392806428f7dc59cb3e", // v1.1.2
  "imjohnbo/issue-bot": "6924a99d928dc228f407d34eb3d0149eda73f2a7", // v3.4.3
  "peter-evans/create-pull-request": "153407881ec5c347639a548ade7d8ad1d6740e38", // v5.0.2
  "slackapi/slack-github-action": "e28cf165c92ffef168d23c5c9000cffc8a25e117", // v1.24.0
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
    const mavenName = `com.${mavenOrg}.${namespace}.providers.${getMavenName(
      providerName
    )}`;
    const repositoryUrl = `github.com/${githubNamespace}/${namespace}-provider-${providerName.replace(
      /-/g,
      ""
    )}`;

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
        mavenGroupId: `com.${mavenOrg}`,
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
            name: "Prepare Repository",
            run: "mv dist .repo",
          },
          {
            name: "Install Dependencies",
            run: "cd .repo && yarn install --check-files --frozen-lockfile",
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
              "sed -i -e '/## Available Packages/,/### Go/!b' -e '/### Go/!d;p; s/### Go/## Go Package/' -e 'd' .repo/dist/go/*/README.md",
              // sed -e is black magic and for whatever reason the string replace doesn't work so let's try it again:
              // eslint-disable-next-line prettier/prettier
              `sed -i 's/### Go/## ${isDeprecated ? 'Deprecated' : 'Go'} Package/' .repo/dist/go/*/README.md`,
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

    const repository = `${githubNamespace}/${namespace}-provider-${providerName.replace(
      /-/g,
      ""
    )}`;

    const workflowRunsOn = options.useCustomGithubRunner
      ? ["custom", "linux", "custom-linux-medium"] // 8 core, 32 GB
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
      devDeps: [
        "@actions/core@^1.1.0",
        "dot-prop@^5.2.0",
        ...(options.devDeps ?? []),
      ],
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

    if (!isDeprecated) {
      const { upgrade, pr } = (this.upgradeWorkflow as any).workflows[0].jobs;
      upgrade.steps.splice(1, 0, setSafeDirectory);
      pr.steps.splice(1, 0, setSafeDirectory);
    }

    // Fix maven issue (https://github.com/cdklabs/publib/pull/777)
    github.GitHub.of(this)?.tryFindWorkflow("release")?.file?.patch(
      JsonPatch.add(
        "/jobs/release_maven/steps/8/env/MAVEN_OPTS",
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
      new ForceRelease(this, {
        workflowRunsOn,
        repositoryUrl,
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

      const releaseJobSteps: any[] = (
        this.github?.tryFindWorkflow("release") as any
      ).jobs.release.steps;
      const gitRemoteJob = releaseJobSteps.find((it) => it.id === "git_remote");
      assert(
        gitRemoteJob.run ===
          'echo "latest_commit=$(git ls-remote origin -h ${{ github.ref }} | cut -f1)" >> $GITHUB_OUTPUT',
        "git_remote step in release workflow did not match expected string, please check if the workaround still works!"
      );
      const previousCommand = gitRemoteJob.run;
      const cancelCommand =
        'echo "latest_commit=release_cancelled" >> $GITHUB_OUTPUT'; // this cancels the release via a non-matching SHA;
      gitRemoteJob.run = `node ./scripts/should-release.js && ${previousCommand} || ${cancelCommand}`;
      gitRemoteJob.name +=
        " or cancel via faking a SHA if release was cancelled";
    }

    // Submodule documentation generation
    this.gitignore.exclude("API.md"); // ignore the old file, we now generate it in the docs folder
    this.addDevDeps("jsii-docgen@^10.2.3");
    this.addDevDeps(`jsii-rosetta@~5.2.0`);

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
  }

  private pinGithubActionVersions(pinnedVersions: Record<string, string>) {
    // Use pinned versions of github actions
    Object.entries(pinnedVersions).forEach(([name, sha]) => {
      this.github?.actions.set(name, `${name}@${sha}`);
    });
  }
}
