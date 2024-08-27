import { CdktfProviderProject, CdktfProviderProjectOptions } from "../../src";

export const getProject = (
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
