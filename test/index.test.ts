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
    cdktfVersion: "0.8.6",
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

  expect(snapshot[".github/workflows/build.yml"]).toContain(
    `CHECKPOINT_DISABLE: "1"`
  );
});
