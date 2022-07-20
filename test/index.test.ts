import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs-extra";
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

describe("versioning", () => {
  let tmpDir: string;
  const ENV_PROJEN_DISABLE_POST = process.env.PROJEN_DISABLE_POST;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync("cdktf-provider-project-");
    process.env.PROJEN_DISABLE_POST = "1";
  });

  it("deploys 1.0 as a first version", () => {
    const outdir = path.resolve(__dirname, "..", tmpDir);
    const project = getProject({
      outdir,
    });
    project.synth();

    let tasksJson;
    // Sets major version to 1.0 if no release has been made
    tasksJson = JSON.parse(
      fs.readFileSync(`${tmpDir}/.projen/tasks.json`, "utf8")
    );
    expect(tasksJson.tasks.release.env.MAJOR).toBe("1");

    // After a release a tag would be created, we simulate this here by manually setting a git tag to 1.0.0
    execSync(`git init`, { cwd: tmpDir });
    execSync(`git config user.email "you@example.com"`, { cwd: tmpDir });
    execSync(`git config user.name "Your Name"`, { cwd: tmpDir });

    execSync(`git add --all`, { cwd: tmpDir });
    execSync(
      `git -c commit.gpgsign=false commit -m 'feat: first release, great success'`,
      {
        cwd: tmpDir,
      }
    );
    execSync(`git tag -a v1.0.0 -m "v1.0.0"`, { cwd: tmpDir });

    // Not sure why but it seems like the project can not be synthed twice from the same test
    const project2 = getProject({ outdir });
    project2.synth();
    tasksJson = JSON.parse(
      fs.readFileSync(`${tmpDir}/.projen/tasks.json`, "utf8")
    );
    // Once this is done we expect the major version not to be forced to 1.0 anymore
    expect(tasksJson.tasks.release.env.MAJOR).toBe(undefined);
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
    process.env.PROJEN_DISABLE_POST = ENV_PROJEN_DISABLE_POST;
  });
});
