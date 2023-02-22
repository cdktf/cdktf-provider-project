/* eslint-disable @typescript-eslint/no-require-imports */
import assert = require("assert");
import { pascalCase } from "change-case";
import { TextFile, cdk } from "projen";
import { JobStep } from "projen/lib/github/workflows-model";
import { AlertOpenPrs } from "./alert-open-prs";
import { AutoCloseCommunityIssues } from "./auto-close-community-issues";
import { CdktfConfig } from "./cdktf-config";
import { CustomizedLicense } from "./customized-license";
import { GithubIssues } from "./github-issues";
import { LockIssues } from "./lock-issues";
import { NextVersionPr } from "./next-version-pr";
import { PackageInfo } from "./package-info";
import { ProviderUpgrade } from "./provider-upgrade";
import { CheckForUpgradesScriptFile } from "./scripts/check-for-upgrades";
import { ShouldReleaseScriptFile } from "./scripts/should-release";

const version = require("../version.json").version;

export interface CdktfProviderProjectOptions extends cdk.JsiiProjectOptions {
  readonly useCustomGithubRunner?: boolean;
  readonly terraformProvider: string;
  readonly cdktfVersion: string;
  readonly constructsVersion: string;
  readonly jsiiVersion?: string;
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
export class CdktfProviderProject extends cdk.JsiiProject {
  constructor(options: CdktfProviderProjectOptions) {
    const {
      terraformProvider,
      workflowContainerImage = "hashicorp/jsii-terraform",
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
        `@cdktf/provider-project@^${version}`,
        "@actions/core@^1.1.0",
        "dot-prop@^5.2.0",
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
      minMajorVersion: 1, // ensure new projects start with 1.0.0 so that every following breaking change leads to an increased major version
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
    });

    // Golang needs more memory to build
    this.tasks.addEnvironment("NODE_OPTIONS", "--max-old-space-size=7168");

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

    new CdktfConfig(this, {
      terraformProvider,
      providerName,
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

    // hacky di hack hack hack - projen releases don't support cancelling a release yet
    (this.tasks.tryFind("release")!.condition as unknown as any) =
      "node ./scripts/should-release.js";
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
    this.addDevDeps("jsii-docgen@>=7.1.2");
    // There is no nice way to tell jsii-docgen to generate docs into a folder so I went this route
    (
      this.tasks.tryFind("docgen")!.steps![0] as any
    ).exec = `rm -rf docs && mkdir docs && jsii-docgen --split-by-submodule -l typescript -l python -l java -l csharp -l go && mv *.*.md docs`;

    // Special overwrite for some very special resources
    console.log("provier", providerName);
    if (providerName === "aws") {
      this.gitattributes.addAttributes(
        "docs/wafv2RuleGroup.*.md",
        "filter=lfs",
        "diff=lfs",
        "merge=lfs",
        "-text"
      );
      this.gitattributes.addAttributes(
        "docs/wafv2WebAcl.*.md",
        "filter=lfs",
        "diff=lfs",
        "merge=lfs",
        "-text"
      );
    }
  }
}
