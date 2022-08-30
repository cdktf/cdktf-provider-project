/* eslint-disable @typescript-eslint/no-require-imports */
import assert = require("assert");
import { pascalCase } from "change-case";
import { cdk } from "projen";
import { AutoMerge } from "./auto-merge";
import { CdktfConfig } from "./cdktf-config";
import { GithubIssues } from "./github-issues";
import { NextVersionPr } from "./next-version-pr";
import { PackageInfo } from "./package-info";
import { ProviderUpgrade } from "./provider-upgrade";

const version = require("../version.json").version;

export interface CdktfProviderProjectOptions extends cdk.JsiiProjectOptions {
  readonly useCustomGithubRunner?: boolean;
  readonly terraformProvider: string;
  readonly cdktfVersion: string;
  readonly constructsVersion: string;
  readonly jsiiVersion?: string;
  readonly forceMajorVersion?: number;
}

const authorName = "HashiCorp";
const authorAddress = "https://hashicorp.com";
const namespace = "cdktf";
const githubNamespace = "hashicorp";

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
    } = options;
    const [fqproviderName, providerVersion] = terraformProvider.split("@");
    const providerName = fqproviderName.split("/").pop();
    assert(providerName, `${terraformProvider} doesn't seem to be valid`);
    assert(
      !providerName.endsWith("-go"),
      "providerName may not end with '-go' as this can conflict with repos for go packages"
    );

    const nugetName = `HashiCorp.${pascalCase(
      namespace
    )}.Providers.${pascalCase(providerName)}`;
    const mavenName = `com.${githubNamespace}.cdktf.providers.${getMavenName(
      providerName
    )}`;

    const packageInfo: PackageInfo = {
      npm: {
        name: `@${namespace}/provider-${providerName}`,
      },
      python: {
        distName: `${namespace}-cdktf-provider-${providerName.replace(
          /-/gi,
          "_"
        )}`,
        module: `${namespace}_cdktf_provider_${providerName.replace(
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
        mavenGroupId: `com.${githubNamespace}`,
        mavenArtifactId: `cdktf-provider-${providerName}`,
        mavenEndpoint: "https://hashicorp.oss.sonatype.org",
      },
      publishToGo: {
        moduleName: `github.com/hashicorp/cdktf-provider-${providerName.replace(
          /-/g,
          ""
        )}-go`,
        gitUserEmail: "github-team-tf-cdk@hashicorp.com",
        gitUserName: "CDK for Terraform Team",
        packageName: providerName.replace(/-/g, ""),
      },
    };

    const repository = `${githubNamespace}/cdktf-provider-${providerName.replace(
      /-/g,
      ""
    )}`;

    super({
      ...options,
      workflowContainerImage,
      license: "MPL-2.0",
      releaseToNpm: true,
      minNodeVersion,
      devDeps: [`@cdktf/provider-project@^${version}`, "dot-prop@^5.2.0"],
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
          labels: ["automerge"],
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
      minMajorVersion: 1, // ensure new projects start with 1.0.0 so that every following breaking change leads to an increased major version
    });

    // Golang needs more memory to build
    this.tasks.addEnvironment("NODE_OPTIONS", "--max-old-space-size=7168");

    this.tasks.addEnvironment("CHECKPOINT_DISABLE", "1");

    new CdktfConfig(this, {
      terraformProvider,
      providerName,
      providerVersion,
      cdktfVersion,
      constructsVersion,
      jsiiVersion,
      packageInfo,
    });
    new ProviderUpgrade(this);
    new AutoMerge(this);
    new GithubIssues(this, { providerName });
    new NextVersionPr(this, "${{ secrets.GITHUB_TOKEN }}");
  }
}
