import { execSync } from "child_process";
import * as fs from "fs-extra";
import path from "path";
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

describe("go builds of repositories with dash succeed", () => {
  let outdir: string;
  beforeAll(() => {
    outdir = fs.mkdtempSync("google-beta-provider-test");
  });

  test("test", () => {
    const project = getProject({
      terraformProvider: "google-beta@~> 4.17",
      outdir,
    });
    project.addDevDeps("@cdktf/provider-project@file:../");
    project.synth();

    // Create a .projenrc.js file in the outdir
    fs.writeFileSync(
      `${outdir}/.projenrc.js`,
      `
const { CdktfProviderProject } = require("@cdktf/provider-project");
const project = new CdktfProviderProject({
  terraformProvider: "google-beta@~> 4.17",
  cdktfVersion: "^0.12.0",
  constructsVersion: "^10.0.0",
  minNodeVersion: "14.17.0",
  jsiiVersion: "^1.53.0",
});
project.addDevDeps("@cdktf/provider-project@file:${path.resolve(
        __dirname,
        ".."
      )}");
project.synth();
    `,
      "utf8"
    );

    // fetch the provider
    execSync(`yarn && yarn fetch`, { cwd: outdir, stdio: "inherit" });

    // Run go build
    execSync(`yarn build && yarn package:go`, {
      cwd: outdir,
      stdio: "inherit",
    });

    // It should have compiled successfully
  });

  afterAll(() => {
    fs.removeSync(outdir);
  });
});
