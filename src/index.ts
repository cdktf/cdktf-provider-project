/* eslint-disable @typescript-eslint/no-require-imports */
import assert = require("assert");
import { pascalCase } from "change-case";
import { TextFile, cdk, github, JsonPatch } from "projen";
import { JobStep } from "projen/lib/github/workflows-model";
import { AlertOpenPrs } from "./alert-open-prs";
import { AutoCloseCommunityIssues } from "./auto-close-community-issues";
import { CdktfConfig } from "./cdktf-config";
import { CopyrightHeaders } from "./copyright-headers";
import { CustomizedLicense } from "./customized-license";
import { ForceRelease } from "./force-release";
import { GithubIssues } from "./github-issues";
import { LockIssues } from "./lock-issues";
import { NextVersionPr } from "./next-version-pr";
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
}

const authorAddress = "https://hashicorp.com";
const getMavenName = (providerName: string): string => {
  return ["null", "random"].includes(providerName)
    ? `${providerName}_provider`
    : providerName.replace(/-/gi, "_");
};

const githubActionPinnedVersions = {
  "actions/checkout": "8e5e7e5ab8b370d6c329ec480221332ada57f0ab", // v3.5.2
  "actions/setup-node": "64ed1c7eab4cce3362f8c340dee64e5eaeef8f7c", // v3.6.0
  "actions/upload-artifact": "0b7f8abb1508181956e8e162db84b466c27e18ce", // v3.1.2
  "actions/download-artifact": "9bc31d5ccc31df68ecc42ccf4149144866c47d8a", // v3.0.2
  "actions/setup-java": "5ffc13f4174014e2d4d4572b3d74c3fa61aeb2c2", // v3.11.0
  "actions/setup-go": "fac708d6674e30b6ba41289acaab6d4b75aa0753", // v4.0.1
  "actions/setup-dotnet": "607fce577a46308457984d59e4954e075820f10a", // v3.0.3
  "actions/setup-python": "bd6b4b6205c4dbad673328db7b31b7fab9e241c0", // v4.6.1
  "dessant/lock-threads": "c1b35aecc5cdb1a34539d14196df55838bb2f836", // v4.0.0
  "peter-evans/create-pull-request": "284f54f989303d2699d373481a0cfa13ad5a6666", // v5.0.1
  "imjohnbo/issue-bot": "6924a99d928dc228f407d34eb3d0149eda73f2a7", // v3.4.3
  "actions/stale": "1160a2240286f5da8ec72b1c0816ce2481aabf84", // v8.0.0
  "slackapi/slack-github-action": "e28cf165c92ffef168d23c5c9000cffc8a25e117", // v1.24.0
  "hashicorp/setup-copywrite": "867a1a2a064a0626db322392806428f7dc59cb3e", // v1.1.2
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
      authorName = "HashiCorp",
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
        moduleName: `github.com/${githubNamespace}/${namespace}-provider-${providerName.replace(
          /-/g,
          ""
        )}-go`,
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
      workflowContainerImage,
      licensed: false, // we do supply our own license file with a custom header
      releaseToNpm: true,
      minNodeVersion,
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
      authorAddress,
      authorName,
      authorOrganization: true,
      defaultReleaseBranch: "main",
      repository: `https://github.com/${repository}.git`,
      mergify: false,
      eslint: false,
      depsUpgradeOptions: {
        workflowOptions: {
          labels: ["automerge", "dependencies"],
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
      workflowRunsOn,
      minMajorVersion: MIN_MAJOR_VERSION,
      githubOptions: {
        mergify: true,
        mergifyOptions: {
          rules: [
            {
              name: "Automatically approve PRs with automerge label",
              actions: {
                review: {
                  type: "APPROVE",
                  message: "Automatically approved due to label",
                },
              },
              conditions: [
                "label=automerge",
                "-label~=(do-not-merge)",
                "-draft",
                "author=team-tf-cdk",
              ],
            },
            {
              name: "Automatically close stale PRs",
              actions: {
                close: {
                  message:
                    "Closing this automatic PR, if it has not merged there is most likely a CI or CDKTF issue preventing it from merging",
                },
              },
              conditions: [
                "author=team-tf-cdk",
                "-draft",
                "created-at<1 day ago",
              ],
            },
          ],
        },
      },
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
          daysBeforeStale: 14,
          staleMessage:
            "14 days have passed since this PR was opened, and I assume other builds have succeeded in the meantime. " +
            "If no one removes the `stale` label or comments, I'm going to auto-close this PR in 7 days.",
          daysBeforeClose: 7,
          closeMessage:
            "I'm closing this PR automatically with the assumption that other builds have succeeded in the meantime.",
        },
      },
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
    const { upgrade, pr } = (this.upgradeWorkflow as any).workflows[0].jobs;
    upgrade.steps.splice(1, 0, setSafeDirectory);
    pr.steps.splice(1, 0, setSafeDirectory);

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
      packageInfo,
      githubNamespace,
    });
    const upgradeScript = new CheckForUpgradesScriptFile(this, {
      providerVersion,
      fqproviderName,
    });
    new ProviderUpgrade(this, {
      checkForUpgradesScriptPath: upgradeScript.path,
      workflowRunsOn,
      nodeHeapSize: maxOldSpaceSize,
    });
    new CustomizedLicense(this, options.creationYear);
    new GithubIssues(this, { providerName });
    new AutoCloseCommunityIssues(this, { providerName });
    new LockIssues(this);
    new NextVersionPr(this, "${{ secrets.GITHUB_TOKEN }}");
    new AlertOpenPrs(this, {
      slackWebhookUrl: "${{ secrets.ALERT_PRS_SLACK_WEBHOOK_URL }}",
      repository,
    });
    new ForceRelease(this, {
      workflowRunsOn,
    });

    new TextFile(this, ".github/CODEOWNERS", {
      lines: [
        "# These owners will be the default owners for everything in ",
        "# the repo. Unless a later match takes precedence, ",
        "# they will be requested for review when someone opens a ",
        "# pull request.",
        "*       @cdktf/tf-cdk-team",
      ],
    });

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
    gitRemoteJob.name += " or cancel via faking a SHA if release was cancelled";

    // Submodule documentation generation
    this.gitignore.exclude("API.md"); // ignore the old file, we now generate it in the docs folder
    this.addDevDeps("jsii-docgen@~9.0.0");
    this.addDevDeps(`jsii-rosetta@~5.1.2`);

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
      steps: [{ builtin: "release/bump-version" }],
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
  }

  private pinGithubActionVersions(pinnedVersions: Record<string, string>) {
    // Use pinned versions of github actions
    Object.entries(pinnedVersions).forEach(([name, sha]) => {
      this.github?.actions.set(name, `${name}@${sha}`);
    });
  }
}
