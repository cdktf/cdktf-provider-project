import { CdktfProviderProject } from "../src";
import { synthSnapshot } from "./utils";

test("synths with minimal options", () => {
  const snapshot = synthSnapshot(
    new CdktfProviderProject({
      name: "test",
      terraformProvider: "random",
      author: "cdktf-team",
      authorAddress: "cdktf-team address",
      cdktfVersion: "0.8.6",
      constructsVersion: "10.0.0",
      defaultReleaseBranch: "main",
      repositoryUrl: "github.com/cdktf/cdktf",
    })
  );

  expect(snapshot).toMatchSnapshot();
});
