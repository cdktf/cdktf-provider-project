/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { synthSnapshot } from "./utils";
import { CdktfProviderProject, CdktfProviderProjectOptions } from "../src";

const getProject = (
  opts: Partial<CdktfProviderProjectOptions> = {}
): CdktfProviderProject =>
  new CdktfProviderProject({
    terraformProvider: "random@~>2.0",
    cdktfVersion: "0.10.3",
    constructsVersion: "10.0.0",
    jsiiVersion: "~5.2.0",
    typescriptVersion: "~5.2.0", // NOTE: this should be the same major/minor version as JSII
    devDeps: ["@cdktf/provider-project@^0.0.0"],
    // NOTE: the below options aren't required to be passed in practice and only need to be here for the test
    // This is because JSII prevents us from declaring the options as a Partial<cdk.JsiiProjectOptions>
    name: "test",
    author: "cdktf-team",
    authorAddress: "https://github.com/cdktf",
    defaultReleaseBranch: "main",
    repositoryUrl: "github.com/cdktf/cdktf",
    forceMajorVersion: 42,
    ...opts,
  });

test("synths with minimal options", () => {
  const snapshot = synthSnapshot(getProject());

  expect(snapshot).toMatchSnapshot();
});

test("build runs without telemetry", () => {
  const snapshot = synthSnapshot(getProject());

  expect(JSON.parse(snapshot[".projen/tasks.json"])).toHaveProperty(
    "env.CHECKPOINT_DISABLE",
    "1"
  );
});

test("build runs without crash reporting", () => {
  const snapshot = synthSnapshot(getProject());

  expect(JSON.parse(snapshot["cdktf.json"])).toHaveProperty(
    "sendCrashReports",
    false
  );
});

test("synths with custom Github runners", () => {
  const snapshot = synthSnapshot(getProject({ useCustomGithubRunner: true }));

  expect(snapshot).toMatchSnapshot();
});

test("synths with an advanced version range syntax", () => {
  const snapshot = synthSnapshot(
    getProject({ cdktfVersion: ">=0.12.2 <0.14.0" })
  );

  expect(snapshot).toMatchSnapshot();
});

test("sets minMajorVersion to 1 by default so that breaking changes increast the major version", () => {
  const snapshot = synthSnapshot(getProject());

  expect(JSON.parse(snapshot[".projen/tasks.json"])).toHaveProperty(
    "tasks.release.env.MIN_MAJOR",
    "1"
  );
});

test("sets resolution for yargs", () => {
  const snapshot = synthSnapshot(getProject());

  const packageJson = JSON.parse(snapshot["package.json"]);
  expect(packageJson).toHaveProperty("resolutions");
  expect(packageJson.resolutions).toHaveProperty("@types/yargs");
  expect(packageJson.resolutions["@types/yargs"]).toEqual("17.0.13");
});

test("README contains provided Namespace", () => {
  const snapshotWithVersion = synthSnapshot(
    getProject({ terraformProvider: "random@~> 3.1" })
  );

  const snapshotWithoutVersion = synthSnapshot(
    getProject({ terraformProvider: "random" })
  );

  expect(snapshotWithVersion["README.md"]).toEqual(
    expect.stringContaining(
      "- [Terraform random provider](https://registry.terraform.io/providers/hashicorp/random/3.1.0)"
    )
  );

  expect(snapshotWithoutVersion["README.md"]).toEqual(
    expect.stringContaining(
      "- [Terraform random provider](https://registry.terraform.io/providers/hashicorp/random/)"
    )
  );
});

test("golang release workflow has copyright headers", () => {
  const snapshot = synthSnapshot(getProject());
  const release = snapshot[".github/workflows/release.yml"];
  const releaseLines = release.split("\n");
  const releaseGoLineIndex = releaseLines.findIndex((line: string) =>
    line.includes("release_go")
  );

  expect(releaseGoLineIndex).toBeGreaterThan(0);

  expect(releaseLines.slice(releaseGoLineIndex + 1).join("\n")).toEqual(
    expect.stringContaining("hashicorp/setup-copywrite")
  );
});

test("has a custom workflow and README if the project is deprecated", () => {
  const snapshot = synthSnapshot(
    getProject({ isDeprecated: true, deprecationDate: "December 11, 2023" })
  );

  expect(snapshot).toMatchSnapshot();

  expect(JSON.parse(snapshot["package.json"])).toHaveProperty(
    "cdktf.isDeprecated",
    true
  );

  expect(snapshot["README.md"]).toEqual(
    expect.stringContaining(
      "HashiCorp made the decision to stop publishing new versions of"
    )
  );

  const release = snapshot[".github/workflows/release.yml"];
  expect(release).toEqual(
    expect.stringContaining(
      "Deprecate the package in package managers if needed"
    )
  );

  const releaseLines = release.split("\n");
  const releaseGoLineIndex = releaseLines.findIndex((line: string) =>
    line.includes("release_go")
  );
  expect(releaseLines.slice(releaseGoLineIndex + 1).join("\n")).toEqual(
    expect.stringContaining(
      "// Deprecated: HashiCorp is no longer publishing new versions of the prebuilt provider for random."
    )
  );
});

test("override licensee", () => {
  const snapshot = synthSnapshot(
    getProject({ creationYear: 2021, licensee: "Acme Corp" })
  );

  expect(snapshot.LICENSE).toEqual(
    expect.stringContaining("Copyright (c) 2021 Acme Corp")
  );
});

test("override maven org", () => {
  const snapshot = synthSnapshot(getProject({ mavenOrg: "gofer" }));

  expect(JSON.parse(snapshot["package.json"])).toHaveProperty(
    "jsii.targets.java.maven.groupId",
    "com.gofer"
  );
  expect(JSON.parse(snapshot["package.json"])).toHaveProperty(
    "jsii.targets.java.package",
    "com.gofer.cdktf.providers.random_provider"
  );
});

test("override maven group id", () => {
  const snapshot = synthSnapshot(getProject({ mavenGroupId: "dev.gofer" }));

  expect(JSON.parse(snapshot["package.json"])).toHaveProperty(
    "jsii.targets.java.maven.groupId",
    "dev.gofer"
  );
  expect(JSON.parse(snapshot["package.json"])).toHaveProperty(
    "jsii.targets.java.package",
    "dev.gofer.cdktf.providers.random_provider"
  );
});

test("with minNodeVersion", () => {
  const snapshot = synthSnapshot(
    new CdktfProviderProject({
      useCustomGithubRunner: false,
      terraformProvider: "vancluever/acme@~> 2.10",
      cdktfVersion: "^0.20.0",
      constructsVersion: "^10.3.0",
      minNodeVersion: "18.12.0",
      jsiiVersion: "~5.3.0",
      typescriptVersion: "~5.3.0", // NOTE: this should be the same major/minor version as JSII
      devDeps: ["@cdktf/provider-project@^0.5.0"],
      isDeprecated: false,
    } as any)
  );

  expect(snapshot).toMatchSnapshot();
});
