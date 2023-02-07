import { CdktfProviderProject, CdktfProviderProjectOptions } from "../src";
import { synthSnapshot } from "./utils";

const getProject = (
  opts: Partial<CdktfProviderProjectOptions> = {}
): CdktfProviderProject =>
  new CdktfProviderProject({
    name: "test",
    terraformProvider: "random",
    author: "cdktf-team",
    authorAddress: "cdktf-team address",
    cdktfVersion: "0.10.3",
    constructsVersion: "10.0.0",
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

  expect(snapshot[".projen/tasks.json"]).toHaveProperty(
    "env.CHECKPOINT_DISABLE",
    "1"
  );
});

test("build runs without crash reporting", () => {
  const snapshot = synthSnapshot(getProject());

  expect(snapshot["cdktf.json"]).toHaveProperty("sendCrashReports", false);
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

  expect(snapshot[".projen/tasks.json"]).toHaveProperty(
    "tasks.release.env.MIN_MAJOR",
    "1"
  );
});

test("sets resolution for yargs", () => {
  const snapshot = synthSnapshot(getProject());

  expect(snapshot["package.json"]).toHaveProperty("resolutions");
  expect(snapshot["package.json"].resolutions).toHaveProperty("@types/yargs");
  expect(snapshot["package.json"].resolutions["@types/yargs"]).toEqual(
    "17.0.13"
  );
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
      "- [Terraform random Provider](https://registry.terraform.io/providers/hashicorp/random/3.1.0)"
    ) &&
      expect.stringContaining(
        "- This links to the minimum version being tracked, you can find the latest released version [in our releases](https://github.com/cdktf/cdktf-provider-random/releases)"
      )
  );

  expect(snapshotWithoutVersion["README.md"]).toEqual(
    expect.stringContaining(
      "- [Terraform random Provider](https://registry.terraform.io/providers/hashicorp/random/)"
    ) &&
      expect.stringContaining(
        "- This links to the minimum version being tracked, you can find the latest released version [in our releases](https://github.com/cdktf/cdktf-provider-random/releases)"
      )
  );
});
